import type { Express, Request, Response } from "express";
import { blogCategoryInputSchema, blogCommentInputSchema, blogPostInputSchema, faqEntryInputSchema, authorProfileInputSchema, seoSettingsInputSchema, adminReplyInputSchema, slugifyText } from "@shared/blog";
import { blogStore } from "./blogStore";
import { computeSpamScore, hashIpAddress, verifyTurnstileToken } from "./commentModeration";
import { sendBlogCommentNotification } from "./email";
import { uploadMediaAsset, deleteMediaAsset, hasMediaUploadConfig } from "./mediaService";
import { renderBlogHubPage, renderBlogPostPage, renderFaqPage } from "./blogRenderer";
import { storage } from "./storage";

const COMMENT_RATE_LIMIT_PER_HOUR = Number(process.env.BLOG_COMMENT_RATE_LIMIT_PER_HOUR || "8");
const COMMENT_RATE_WINDOW_MS = 60 * 60 * 1000;
const BLOG_PAGE_SIZE = 6;
const commentRateMap = new Map<string, number[]>();

function getBaseUrl(req: Request): string {
  if (process.env.PUBLIC_BASE_URL) {
    return process.env.PUBLIC_BASE_URL.replace(/\/$/, "");
  }

  const forwardedProto = req.headers["x-forwarded-proto"];
  const proto = typeof forwardedProto === "string" ? forwardedProto.split(",")[0] : req.protocol;
  const host = req.get("host");
  return `${proto}://${host}`;
}

function getRequestIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }

  return req.ip || "unknown";
}

function parseBoolean(value: unknown): boolean {
  return value === true || value === "true" || value === 1 || value === "1";
}

function parseNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function sanitizeRedirectTarget(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/")) {
    return "/blog";
  }

  return value;
}

function isCommentRateAllowed(ip: string): boolean {
  const now = Date.now();
  const current = commentRateMap.get(ip) || [];
  const filtered = current.filter((timestamp) => now - timestamp < COMMENT_RATE_WINDOW_MS);

  if (filtered.length >= COMMENT_RATE_LIMIT_PER_HOUR) {
    commentRateMap.set(ip, filtered);
    return false;
  }

  filtered.push(now);
  commentRateMap.set(ip, filtered);
  return true;
}

async function requireAdminSession(req: Request, res: Response): Promise<boolean> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }

  const token = authHeader.substring(7);
  const session = await storage.getSessionByToken(token);

  if (!session) {
    res.status(401).json({ error: "Session expired or invalid" });
    return false;
  }

  return true;
}

function redirectWithCommentState(res: Response, redirectTo: string, state: "success" | "error") {
  const separator = redirectTo.includes("?") ? "&" : "?";
  res.redirect(`${redirectTo}${separator}comment=${state}`);
}

function renderNotFoundPage(title: string, message: string) {
  return `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${title}</title>
      <style>
        body { margin: 0; font-family: Inter, system-ui, sans-serif; background: #f8fafc; color: #0f172a; }
        main { min-height: 100vh; display: grid; place-items: center; padding: 24px; }
        section { max-width: 560px; padding: 28px; border-radius: 24px; background: white; border: 1px solid #cbd5e1; box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08); }
        a { color: #1d4ed8; text-decoration: none; font-weight: 700; }
      </style>
    </head>
    <body>
      <main>
        <section>
          <h1>${title}</h1>
          <p>${message}</p>
          <p><a href="/blog">Back to blog</a></p>
        </section>
      </main>
    </body>
  </html>`;
}

export async function registerBlogRoutes(app: Express) {
  app.get("/api/blog/posts", async (req: Request, res: Response) => {
    try {
      const featuredOnly = parseBoolean(req.query.featured);
      const limit = Math.max(0, parseNumber(req.query.limit, 0));
      const posts = await blogStore.listPosts({
        featuredOnly,
        search: typeof req.query.q === "string" ? req.query.q : "",
        categorySlug: typeof req.query.category === "string" ? req.query.category : "",
        limit: limit || undefined,
      });

      res.json(posts);
    } catch (error) {
      console.error("Get blog posts error:", error);
      res.status(500).json({ error: "Failed to fetch blog posts." });
    }
  });

  app.get("/api/blog/categories", async (_req: Request, res: Response) => {
    try {
      const categories = await blogStore.listCategories(true);
      res.json(categories);
    } catch (error) {
      console.error("Get blog categories error:", error);
      res.status(500).json({ error: "Failed to fetch categories." });
    }
  });

  app.get("/api/blog/faqs", async (req: Request, res: Response) => {
    try {
      const scope = req.query.scope === "post" ? "post" : "global";
      const postId = typeof req.query.postId === "string" ? req.query.postId : undefined;
      const faqs = await blogStore.listFaqs({ scope, postId, visibleOnly: true });
      res.json(faqs);
    } catch (error) {
      console.error("Get blog faqs error:", error);
      res.status(500).json({ error: "Failed to fetch FAQs." });
    }
  });

  app.post("/api/blog/:slug/comments", async (req: Request, res: Response) => {
    const redirectTo = sanitizeRedirectTarget(req.body?.redirectTo);

    try {
      const ip = getRequestIp(req);
      if (!isCommentRateAllowed(ip)) {
        if (req.is("application/json")) {
          return res.status(429).json({ error: "Too many comments. Please try again later." });
        }

        return redirectWithCommentState(res, redirectTo, "error");
      }

      const post = await blogStore.getPostBySlug(req.params.slug, false);
      if (!post) {
        if (req.is("application/json")) {
          return res.status(404).json({ error: "Post not found." });
        }

        return res.status(404).send(renderNotFoundPage("Post Not Found", "That article could not be found."));
      }

      const parsed = blogCommentInputSchema.safeParse({
        displayName: req.body?.displayName,
        email: req.body?.email || null,
        body: req.body?.body,
        turnstileToken:
          req.body?.turnstileToken ||
          req.body?.["cf-turnstile-response"] ||
          req.body?.cfTurnstileResponse ||
          "",
      });

      if (!parsed.success) {
        if (req.is("application/json")) {
          return res.status(400).json({ error: "Invalid comment data.", details: parsed.error.flatten() });
        }

        return redirectWithCommentState(res, redirectTo, "error");
      }

      const turnstileValid = await verifyTurnstileToken(parsed.data.turnstileToken || "", ip);
      if (!turnstileValid) {
        if (req.is("application/json")) {
          return res.status(400).json({ error: "Captcha verification failed." });
        }

        return redirectWithCommentState(res, redirectTo, "error");
      }

      const spamScore = computeSpamScore(parsed.data.body, parsed.data.email);
      const comment = await blogStore.createComment(post.id, parsed.data, {
        spamScore,
        ipHash: hashIpAddress(ip),
      });

      const baseUrl = getBaseUrl(req);
      await sendBlogCommentNotification({
        postTitle: post.title,
        postUrl: `${baseUrl}/blog/${post.slug}`,
        displayName: comment.displayName,
        email: comment.email,
        body: comment.body,
      });

      if (req.is("application/json")) {
        return res.json({ success: true, comment });
      }

      return redirectWithCommentState(res, redirectTo, "success");
    } catch (error) {
      console.error("Create blog comment error:", error);
      if (req.is("application/json")) {
        return res.status(500).json({ error: "Failed to create comment." });
      }

      return redirectWithCommentState(res, redirectTo, "error");
    }
  });

  app.get("/api/admin/blog/posts", async (req: Request, res: Response) => {
    try {
      if (!(await requireAdminSession(req, res))) return;
      const posts = await blogStore.listPosts({ includeUnpublished: true });
      res.json(posts);
    } catch (error) {
      console.error("Admin blog posts error:", error);
      res.status(500).json({ error: "Failed to fetch blog posts." });
    }
  });

  app.post("/api/admin/blog/posts", async (req: Request, res: Response) => {
    try {
      if (!(await requireAdminSession(req, res))) return;

      const parsed = blogPostInputSchema.safeParse({
        ...req.body,
        featured: parseBoolean(req.body?.featured),
        featuredOrder: parseNumber(req.body?.featuredOrder, 0),
      });

      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid post data.", details: parsed.error.flatten() });
      }

      const post = await blogStore.savePost(parsed.data);
      res.json({ success: true, post });
    } catch (error: any) {
      console.error("Create blog post error:", error);
      res.status(400).json({ error: error?.message || "Failed to save post." });
    }
  });

  app.put("/api/admin/blog/posts/:id", async (req: Request, res: Response) => {
    try {
      if (!(await requireAdminSession(req, res))) return;

      const parsed = blogPostInputSchema.safeParse({
        ...req.body,
        featured: parseBoolean(req.body?.featured),
        featuredOrder: parseNumber(req.body?.featuredOrder, 0),
      });

      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid post data.", details: parsed.error.flatten() });
      }

      const post = await blogStore.savePost(parsed.data, req.params.id);
      res.json({ success: true, post });
    } catch (error: any) {
      console.error("Update blog post error:", error);
      res.status(400).json({ error: error?.message || "Failed to update post." });
    }
  });

  app.post("/api/admin/blog/posts/:id/duplicate", async (req: Request, res: Response) => {
    try {
      if (!(await requireAdminSession(req, res))) return;

      const existing = await blogStore.getPostById(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Post not found." });
      }

      const duplicate = await blogStore.savePost(
        {
          title: `${existing.title} Copy`,
          slug: `${slugifyText(existing.title)}-${Date.now()}`,
          excerpt: existing.excerpt,
          status: "draft",
          featuredImageUrl: existing.featuredImageUrl,
          featuredImageAlt: existing.featuredImageAlt,
          categoryIds: existing.categoryIds,
          tags: existing.tags,
          contentBlocks: existing.contentBlocks,
          relatedServiceIds: existing.relatedServiceIds,
          faqIds: existing.faqIds,
          featured: false,
          featuredOrder: 0,
          seoTitle: existing.seoTitle,
          seoDescription: existing.seoDescription,
          canonicalUrl: null,
          socialImageUrl: existing.socialImageUrl,
          socialImageAlt: existing.socialImageAlt,
          scheduledFor: null,
        },
      );

      res.json({ success: true, post: duplicate });
    } catch (error: any) {
      console.error("Duplicate blog post error:", error);
      res.status(400).json({ error: error?.message || "Failed to duplicate post." });
    }
  });

  app.delete("/api/admin/blog/posts/:id", async (req: Request, res: Response) => {
    try {
      if (!(await requireAdminSession(req, res))) return;
      await blogStore.deletePost(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete blog post error:", error);
      res.status(500).json({ error: "Failed to delete post." });
    }
  });

  app.get("/api/admin/blog/categories", async (req: Request, res: Response) => {
    try {
      if (!(await requireAdminSession(req, res))) return;
      const categories = await blogStore.listCategories(false);
      res.json(categories);
    } catch (error) {
      console.error("Admin blog categories error:", error);
      res.status(500).json({ error: "Failed to fetch categories." });
    }
  });

  app.post("/api/admin/blog/categories", async (req: Request, res: Response) => {
    try {
      if (!(await requireAdminSession(req, res))) return;
      const parsed = blogCategoryInputSchema.safeParse({
        ...req.body,
        visible: parseBoolean(req.body?.visible ?? true),
        order: parseNumber(req.body?.order, 0),
      });

      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid category data.", details: parsed.error.flatten() });
      }

      const category = await blogStore.saveCategory(parsed.data);
      res.json({ success: true, category });
    } catch (error: any) {
      console.error("Create category error:", error);
      res.status(400).json({ error: error?.message || "Failed to save category." });
    }
  });

  app.put("/api/admin/blog/categories/:id", async (req: Request, res: Response) => {
    try {
      if (!(await requireAdminSession(req, res))) return;
      const parsed = blogCategoryInputSchema.safeParse({
        ...req.body,
        visible: parseBoolean(req.body?.visible ?? true),
        order: parseNumber(req.body?.order, 0),
      });

      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid category data.", details: parsed.error.flatten() });
      }

      const category = await blogStore.saveCategory(parsed.data, req.params.id);
      res.json({ success: true, category });
    } catch (error: any) {
      console.error("Update category error:", error);
      res.status(400).json({ error: error?.message || "Failed to update category." });
    }
  });

  app.delete("/api/admin/blog/categories/:id", async (req: Request, res: Response) => {
    try {
      if (!(await requireAdminSession(req, res))) return;
      await blogStore.deleteCategory(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete category error:", error);
      res.status(500).json({ error: "Failed to delete category." });
    }
  });

  app.get("/api/admin/blog/faqs", async (req: Request, res: Response) => {
    try {
      if (!(await requireAdminSession(req, res))) return;
      const scope = req.query.scope === "post" ? "post" : req.query.scope === "global" ? "global" : undefined;
      const faqs = await blogStore.listFaqs({
        scope,
        postId: typeof req.query.postId === "string" ? req.query.postId : undefined,
        visibleOnly: false,
      });
      res.json(faqs);
    } catch (error) {
      console.error("Admin blog FAQs error:", error);
      res.status(500).json({ error: "Failed to fetch FAQs." });
    }
  });

  app.post("/api/admin/blog/faqs", async (req: Request, res: Response) => {
    try {
      if (!(await requireAdminSession(req, res))) return;
      const parsed = faqEntryInputSchema.safeParse({
        ...req.body,
        visible: parseBoolean(req.body?.visible ?? true),
        order: parseNumber(req.body?.order, 0),
      });

      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid FAQ data.", details: parsed.error.flatten() });
      }

      const faq = await blogStore.saveFaq(parsed.data);
      res.json({ success: true, faq });
    } catch (error: any) {
      console.error("Create FAQ error:", error);
      res.status(400).json({ error: error?.message || "Failed to save FAQ." });
    }
  });

  app.put("/api/admin/blog/faqs/:id", async (req: Request, res: Response) => {
    try {
      if (!(await requireAdminSession(req, res))) return;
      const parsed = faqEntryInputSchema.safeParse({
        ...req.body,
        visible: parseBoolean(req.body?.visible ?? true),
        order: parseNumber(req.body?.order, 0),
      });

      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid FAQ data.", details: parsed.error.flatten() });
      }

      const faq = await blogStore.saveFaq(parsed.data, req.params.id);
      res.json({ success: true, faq });
    } catch (error: any) {
      console.error("Update FAQ error:", error);
      res.status(400).json({ error: error?.message || "Failed to update FAQ." });
    }
  });

  app.delete("/api/admin/blog/faqs/:id", async (req: Request, res: Response) => {
    try {
      if (!(await requireAdminSession(req, res))) return;
      await blogStore.deleteFaq(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete FAQ error:", error);
      res.status(500).json({ error: "Failed to delete FAQ." });
    }
  });

  app.get("/api/admin/blog/comments", async (req: Request, res: Response) => {
    try {
      if (!(await requireAdminSession(req, res))) return;
      const comments = await blogStore.listComments({
        postId: typeof req.query.postId === "string" ? req.query.postId : undefined,
        visibleOnly: false,
      });
      res.json(comments);
    } catch (error) {
      console.error("Admin blog comments error:", error);
      res.status(500).json({ error: "Failed to fetch comments." });
    }
  });

  app.patch("/api/admin/blog/comments/:id", async (req: Request, res: Response) => {
    try {
      if (!(await requireAdminSession(req, res))) return;
      const status = req.body?.status;
      if (status !== "visible" && status !== "hidden" && status !== "spam") {
        return res.status(400).json({ error: "Invalid comment status." });
      }

      const comment = await blogStore.updateCommentStatus(req.params.id, status);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found." });
      }

      res.json({ success: true, comment });
    } catch (error) {
      console.error("Update comment status error:", error);
      res.status(500).json({ error: "Failed to update comment." });
    }
  });

  app.post("/api/admin/blog/comments/:id/replies", async (req: Request, res: Response) => {
    try {
      if (!(await requireAdminSession(req, res))) return;
      const parsed = adminReplyInputSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid reply body.", details: parsed.error.flatten() });
      }

      const reply = await blogStore.createAdminReply(req.params.id, parsed.data);
      res.json({ success: true, reply });
    } catch (error: any) {
      console.error("Create admin reply error:", error);
      res.status(400).json({ error: error?.message || "Failed to create reply." });
    }
  });

  app.get("/api/admin/blog/media", async (req: Request, res: Response) => {
    try {
      if (!(await requireAdminSession(req, res))) return;
      const media = await blogStore.listMediaAssets();
      res.json({ configured: hasMediaUploadConfig(), media });
    } catch (error) {
      console.error("Get media assets error:", error);
      res.status(500).json({ error: "Failed to fetch media assets." });
    }
  });

  app.post("/api/admin/blog/media/upload", async (req: Request, res: Response) => {
    try {
      if (!(await requireAdminSession(req, res))) return;
      if (!hasMediaUploadConfig()) {
        return res.status(503).json({ error: "Media uploads are not configured. Set GCS_BUCKET_NAME first." });
      }

      const { fileName, mimeType, base64Data, alt } = req.body || {};
      if (
        typeof fileName !== "string" ||
        typeof mimeType !== "string" ||
        typeof base64Data !== "string"
      ) {
        return res.status(400).json({ error: "Missing upload payload." });
      }

      const media = await uploadMediaAsset({
        fileName,
        mimeType,
        base64Data,
        alt: typeof alt === "string" ? alt : "",
      });

      res.json({ success: true, media });
    } catch (error: any) {
      console.error("Upload media error:", error);
      res.status(400).json({ error: error?.message || "Failed to upload media." });
    }
  });

  app.patch("/api/admin/blog/media/:id", async (req: Request, res: Response) => {
    try {
      if (!(await requireAdminSession(req, res))) return;
      const media = await blogStore.updateMediaAlt(req.params.id, typeof req.body?.alt === "string" ? req.body.alt : "");
      if (!media) {
        return res.status(404).json({ error: "Media asset not found." });
      }
      res.json({ success: true, media });
    } catch (error) {
      console.error("Update media alt error:", error);
      res.status(500).json({ error: "Failed to update media asset." });
    }
  });

  app.delete("/api/admin/blog/media/:id", async (req: Request, res: Response) => {
    try {
      if (!(await requireAdminSession(req, res))) return;
      await deleteMediaAsset(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete media asset error:", error);
      res.status(500).json({ error: "Failed to delete media asset." });
    }
  });

  app.get("/api/admin/blog/settings", async (req: Request, res: Response) => {
    try {
      if (!(await requireAdminSession(req, res))) return;
      const [settings, author] = await Promise.all([blogStore.getSeoSettings(), blogStore.getAuthorProfile()]);
      res.json({ settings, author, mediaConfigured: hasMediaUploadConfig() });
    } catch (error) {
      console.error("Get blog settings error:", error);
      res.status(500).json({ error: "Failed to fetch settings." });
    }
  });

  app.put("/api/admin/blog/settings/seo", async (req: Request, res: Response) => {
    try {
      if (!(await requireAdminSession(req, res))) return;
      const parsed = seoSettingsInputSchema.safeParse({
        ...req.body,
        siteKeywords: Array.isArray(req.body?.siteKeywords) ? req.body.siteKeywords : req.body?.siteKeywords ?? "",
      });

      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid SEO settings.", details: parsed.error.flatten() });
      }

      const settings = await blogStore.upsertSeoSettings(parsed.data);
      res.json({ success: true, settings });
    } catch (error: any) {
      console.error("Update SEO settings error:", error);
      res.status(400).json({ error: error?.message || "Failed to update SEO settings." });
    }
  });

  app.put("/api/admin/blog/settings/author", async (req: Request, res: Response) => {
    try {
      if (!(await requireAdminSession(req, res))) return;
      const parsed = authorProfileInputSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid author profile.", details: parsed.error.flatten() });
      }

      const author = await blogStore.upsertAuthorProfile(parsed.data);
      res.json({ success: true, author });
    } catch (error: any) {
      console.error("Update author profile error:", error);
      res.status(400).json({ error: error?.message || "Failed to update author profile." });
    }
  });

  app.get("/blog", async (req: Request, res: Response) => {
    try {
      const [settings, author, categories, posts] = await Promise.all([
        blogStore.getSeoSettings(),
        blogStore.getAuthorProfile(),
        blogStore.listCategories(true),
        blogStore.listPosts({
          search: typeof req.query.q === "string" ? req.query.q : "",
          categorySlug: typeof req.query.category === "string" ? req.query.category : "",
        }),
      ]);

      res.send(
        renderBlogHubPage({
          settings,
          author,
          posts,
          categories,
          selectedCategory: typeof req.query.category === "string" ? req.query.category : "",
          search: typeof req.query.q === "string" ? req.query.q : "",
          page: Math.max(1, parseNumber(req.query.page, 1)),
          pageSize: BLOG_PAGE_SIZE,
          baseUrl: getBaseUrl(req),
        }),
      );
    } catch (error) {
      console.error("Render blog hub error:", error);
      res.status(500).send(renderNotFoundPage("Blog Error", "The blog could not be loaded right now."));
    }
  });

  app.get("/blog/category/:slug", async (req: Request, res: Response) => {
    const params = new URLSearchParams(req.query as Record<string, string>);
    params.set("category", req.params.slug);
    const query = params.toString();
    res.redirect(`/blog${query ? `?${query}` : ""}`);
  });

  app.get("/blog/:slug", async (req: Request, res: Response) => {
    try {
      const [settings, author, post] = await Promise.all([
        blogStore.getSeoSettings(),
        blogStore.getAuthorProfile(),
        blogStore.getPostDetailBySlug(req.params.slug, false),
      ]);

      if (!post) {
        return res.status(404).send(renderNotFoundPage("Article Not Found", "The article you requested is missing."));
      }

      const commentState =
        req.query.comment === "success" ? "success" : req.query.comment === "error" ? "error" : null;

      res.send(
        renderBlogPostPage({
          settings,
          author,
          post,
          baseUrl: getBaseUrl(req),
          commentState,
          turnstileSiteKey: process.env.TURNSTILE_SITE_KEY?.trim() || "",
        }),
      );
    } catch (error) {
      console.error("Render blog post error:", error);
      res.status(500).send(renderNotFoundPage("Article Error", "The article could not be loaded right now."));
    }
  });

  app.get("/faq", async (req: Request, res: Response) => {
    try {
      const [settings, faqs] = await Promise.all([
        blogStore.getSeoSettings(),
        blogStore.listFaqs({ scope: "global", visibleOnly: true }),
      ]);

      res.send(
        renderFaqPage({
          settings,
          faqs,
          baseUrl: getBaseUrl(req),
        }),
      );
    } catch (error) {
      console.error("Render faq page error:", error);
      res.status(500).send(renderNotFoundPage("FAQ Error", "The FAQ page could not be loaded right now."));
    }
  });

  app.get("/sitemap.xml", async (req: Request, res: Response) => {
    try {
      const baseUrl = getBaseUrl(req);
      const [posts, categories] = await Promise.all([
        blogStore.listPosts(),
        blogStore.listCategories(true),
      ]);

      const urls = [
        { loc: `${baseUrl}/`, lastmod: new Date().toISOString() },
        { loc: `${baseUrl}/blog`, lastmod: new Date().toISOString() },
        { loc: `${baseUrl}/faq`, lastmod: new Date().toISOString() },
        ...categories.map((category) => ({
          loc: `${baseUrl}/blog/category/${category.slug}`,
          lastmod: category.updatedAt.toISOString(),
        })),
        ...posts.map((post) => ({
          loc: `${baseUrl}/blog/${post.slug}`,
          lastmod: (post.updatedAt || post.publishedAt || new Date()).toISOString(),
        })),
      ];

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (entry) => `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
  </url>`,
  )
  .join("\n")}
</urlset>`;

      res.type("application/xml").send(xml);
    } catch (error) {
      console.error("Render sitemap error:", error);
      res.status(500).type("application/xml").send("<error>Failed to build sitemap</error>");
    }
  });

  app.get("/robots.txt", (req: Request, res: Response) => {
    const baseUrl = getBaseUrl(req);
    res.type("text/plain").send(`User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml\n`);
  });
}
