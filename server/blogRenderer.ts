import type { AuthorProfile, BlogComment, BlogContentBlock, BlogPostDetail, BlogPostSummary, FaqEntry, SeoSettings } from "@shared/blog";
import { serviceCatalog } from "@shared/serviceCatalog";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function nl2br(value: string): string {
  return escapeHtml(value).replace(/\n+/g, "</p><p>");
}

function formatDate(value: Date | null): string {
  if (!value) return "";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(value);
}

function summarize(blocks: BlogContentBlock[]): string {
  const firstText = blocks.find((block) => block.type === "rich_text");
  if (!firstText) return "";
  return firstText.body.slice(0, 200);
}

function renderPageShell(params: {
  title: string;
  description: string;
  canonicalUrl: string;
  ogImageUrl: string | null;
  jsonLd: unknown[];
  body: string;
  pageTitle?: string;
  activeNav: "blog" | "faq" | "home";
}) {
  const { title, description, canonicalUrl, ogImageUrl, jsonLd, body, pageTitle, activeNav } = params;
  const twitterCard = ogImageUrl ? "summary_large_image" : "summary";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="${pageTitle ? "article" : "website"}" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
    ${ogImageUrl ? `<meta property="og:image" content="${escapeHtml(ogImageUrl)}" />` : ""}
    <meta name="twitter:card" content="${twitterCard}" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    ${ogImageUrl ? `<meta name="twitter:image" content="${escapeHtml(ogImageUrl)}" />` : ""}
    <style>
      :root {
        --bg: #f8fafc;
        --surface: #ffffff;
        --surface-soft: #e2e8f0;
        --text: #0f172a;
        --muted: #475569;
        --brand: #1d4ed8;
        --brand-dark: #1e3a8a;
        --accent: #0f766e;
        --border: #cbd5e1;
        --shadow: rgba(15, 23, 42, 0.08);
      }

      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: linear-gradient(180deg, #f8fafc 0%, #eff6ff 100%);
        color: var(--text);
      }

      a { color: inherit; text-decoration: none; }
      .page { min-height: 100vh; }
      .container { width: min(1120px, calc(100vw - 32px)); margin: 0 auto; }
      .shell-header {
        position: sticky;
        top: 0;
        z-index: 10;
        backdrop-filter: blur(10px);
        background: rgba(255, 255, 255, 0.92);
        border-bottom: 1px solid rgba(148, 163, 184, 0.22);
      }
      .shell-header-inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        padding: 18px 0;
      }
      .brand {
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 700;
      }
      .brand img { width: 40px; height: 40px; object-fit: contain; }
      .nav { display: flex; flex-wrap: wrap; gap: 10px; }
      .nav a {
        padding: 10px 14px;
        border-radius: 999px;
        color: var(--muted);
        font-size: 14px;
        font-weight: 600;
      }
      .nav a.active { background: #dbeafe; color: var(--brand-dark); }
      .hero {
        padding: 48px 0 24px;
      }
      .eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 999px;
        background: rgba(219, 234, 254, 0.9);
        color: var(--brand-dark);
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.02em;
        text-transform: uppercase;
      }
      h1, h2, h3, h4 { margin: 0 0 14px; line-height: 1.08; }
      h1 { font-size: clamp(2.3rem, 6vw, 4.2rem); max-width: 12ch; }
      h2 { font-size: clamp(1.7rem, 4vw, 2.4rem); }
      h3 { font-size: 1.15rem; }
      p { margin: 0; line-height: 1.75; color: var(--muted); }
      .hero-copy { max-width: 760px; display: grid; gap: 16px; }
      .card-grid { display: grid; gap: 22px; }
      .post-grid { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
      .card {
        background: rgba(255, 255, 255, 0.94);
        border: 1px solid rgba(148, 163, 184, 0.22);
        border-radius: 26px;
        box-shadow: 0 20px 55px var(--shadow);
        overflow: hidden;
      }
      .card-body { padding: 22px; display: grid; gap: 14px; }
      .post-image {
        width: 100%;
        height: 220px;
        object-fit: cover;
        display: block;
        background: #dbeafe;
      }
      .chip-row { display: flex; gap: 8px; flex-wrap: wrap; }
      .chip {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 999px;
        background: #eff6ff;
        color: var(--brand-dark);
        font-size: 13px;
        font-weight: 600;
      }
      .toolbar {
        display: grid;
        gap: 16px;
        margin: 24px 0 32px;
        padding: 20px;
        background: rgba(255, 255, 255, 0.92);
        border-radius: 26px;
        border: 1px solid rgba(148, 163, 184, 0.22);
        box-shadow: 0 18px 44px var(--shadow);
      }
      .toolbar-row {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: center;
      }
      .field, .button, select, textarea {
        border-radius: 16px;
        border: 1px solid var(--border);
        font: inherit;
      }
      .field, select {
        padding: 12px 14px;
        background: white;
        min-height: 46px;
      }
      .search-field { min-width: min(100%, 360px); }
      .button {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        gap: 8px;
        padding: 12px 18px;
        background: var(--brand);
        color: white;
        font-weight: 700;
        cursor: pointer;
      }
      .button.secondary {
        background: white;
        color: var(--brand-dark);
      }
      .meta {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        color: var(--muted);
        font-size: 14px;
      }
      .article-shell {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 300px;
        gap: 28px;
        align-items: start;
      }
      .article-main {
        background: rgba(255, 255, 255, 0.96);
        border-radius: 30px;
        border: 1px solid rgba(148, 163, 184, 0.22);
        box-shadow: 0 22px 60px var(--shadow);
        overflow: hidden;
      }
      .article-content { padding: 28px; display: grid; gap: 26px; }
      .article-content p { font-size: 17px; color: #334155; }
      .article-content .lead { font-size: 18px; color: #0f172a; font-weight: 600; }
      .block { display: grid; gap: 12px; }
      .block img {
        width: 100%;
        border-radius: 20px;
        max-height: 420px;
        object-fit: cover;
      }
      .quote-block {
        padding: 24px;
        border-radius: 24px;
        background: linear-gradient(135deg, #dbeafe, #ecfeff);
        border: 1px solid rgba(59, 130, 246, 0.16);
      }
      .quote-block blockquote {
        margin: 0;
        font-size: 22px;
        line-height: 1.5;
        color: #0f172a;
        font-weight: 700;
      }
      .quote-block cite {
        display: block;
        margin-top: 12px;
        color: #0f766e;
        font-style: normal;
        font-weight: 600;
      }
      .cta-block {
        padding: 24px;
        border-radius: 24px;
        background: linear-gradient(135deg, #0f172a, #1e3a8a);
        color: white;
        display: grid;
        gap: 12px;
      }
      .cta-block p { color: rgba(255, 255, 255, 0.78); }
      .article-aside {
        display: grid;
        gap: 18px;
        position: sticky;
        top: 96px;
      }
      .aside-card {
        padding: 20px;
        background: rgba(255, 255, 255, 0.94);
        border: 1px solid rgba(148, 163, 184, 0.22);
        border-radius: 24px;
        box-shadow: 0 16px 40px var(--shadow);
        display: grid;
        gap: 14px;
      }
      .faq-list, .comment-list { display: grid; gap: 14px; }
      .faq-item, .comment-item {
        padding: 18px;
        border-radius: 18px;
        background: rgba(248, 250, 252, 0.96);
        border: 1px solid rgba(148, 163, 184, 0.18);
      }
      .comment-reply {
        margin-top: 12px;
        padding: 14px;
        border-left: 3px solid #60a5fa;
        background: rgba(239, 246, 255, 0.96);
        border-radius: 0 14px 14px 0;
      }
      .form {
        display: grid;
        gap: 12px;
        padding: 20px;
        border-radius: 24px;
        border: 1px solid rgba(148, 163, 184, 0.22);
        background: rgba(255, 255, 255, 0.94);
        box-shadow: 0 16px 40px var(--shadow);
      }
      textarea {
        min-height: 150px;
        padding: 14px 16px;
        resize: vertical;
      }
      .two-col {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }
      .status-banner {
        margin-bottom: 18px;
        padding: 16px 18px;
        border-radius: 18px;
        font-weight: 600;
      }
      .status-success { background: #dcfce7; color: #166534; }
      .status-error { background: #fee2e2; color: #991b1b; }
      .pagination {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        justify-content: center;
        margin: 28px 0 0;
      }
      .pagination a, .pagination span {
        width: 42px;
        height: 42px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        border: 1px solid var(--border);
        background: white;
        color: var(--muted);
        font-weight: 700;
      }
      .pagination span.active {
        background: var(--brand);
        border-color: var(--brand);
        color: white;
      }
      .site-footer {
        margin-top: 56px;
        padding: 32px 0 48px;
        color: var(--muted);
      }
      .site-footer-inner {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: 12px;
        padding-top: 24px;
        border-top: 1px solid rgba(148, 163, 184, 0.24);
      }
      @media (max-width: 920px) {
        .article-shell { grid-template-columns: 1fr; }
        .article-aside { position: static; }
      }
      @media (max-width: 640px) {
        .container { width: min(1120px, calc(100vw - 20px)); }
        .shell-header-inner { align-items: flex-start; }
        .two-col { grid-template-columns: 1fr; }
        .article-content { padding: 20px; }
      }
    </style>
    ${jsonLd
      .map((entry) => `<script type="application/ld+json">${JSON.stringify(entry)}</script>`)
      .join("\n")}
  </head>
  <body>
    <div class="page">
      <header class="shell-header">
        <div class="container shell-header-inner">
          <a href="/" class="brand">
            <img src="/logo.png" alt="InterBridge logo" />
            <span>InterBridge</span>
          </a>
          <nav class="nav" aria-label="Main navigation">
            <a href="/" class="${activeNav === "home" ? "active" : ""}">Home</a>
            <a href="/blog" class="${activeNav === "blog" ? "active" : ""}">Blog</a>
            <a href="/faq" class="${activeNav === "faq" ? "active" : ""}">FAQ</a>
            <a href="/#contact">Contact</a>
          </nav>
        </div>
      </header>
      ${body}
      <footer class="site-footer">
        <div class="container site-footer-inner">
          <div>InterBridge Trans & Trade</div>
          <div><a href="/">Back to website</a></div>
        </div>
      </footer>
    </div>
  </body>
</html>`;
}

function renderServiceCards(serviceIds: string[]): string {
  const items = serviceCatalog.filter((service) => serviceIds.includes(service.id));
  if (items.length === 0) return "";

  return `
    <div class="aside-card">
      <h3>Related Services</h3>
      ${items
        .map(
          (service) => `
            <a href="${escapeHtml(service.path)}" class="comment-item">
              <strong>${escapeHtml(service.title)}</strong>
              <p>${escapeHtml(service.description)}</p>
            </a>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderBlocks(blocks: BlogContentBlock[]): string {
  return blocks
    .map((block) => {
      if (block.type === "rich_text") {
        return `
          <section class="block">
            ${block.title ? `<h2>${escapeHtml(block.title)}</h2>` : ""}
            <div><p>${nl2br(block.body)}</p></div>
          </section>
        `;
      }

      if (block.type === "image") {
        return `
          <figure class="block">
            <img src="${escapeHtml(block.src)}" alt="${escapeHtml(block.alt)}" />
            ${block.caption ? `<figcaption><p>${escapeHtml(block.caption)}</p></figcaption>` : ""}
          </figure>
        `;
      }

      if (block.type === "quote") {
        return `
          <section class="quote-block">
            <blockquote>${escapeHtml(block.quote)}</blockquote>
            ${block.attribution ? `<cite>${escapeHtml(block.attribution)}</cite>` : ""}
          </section>
        `;
      }

      return `
        <section class="cta-block">
          <h3>${escapeHtml(block.heading)}</h3>
          <p>${escapeHtml(block.body)}</p>
          <a class="button" href="${escapeHtml(block.buttonLink)}">${escapeHtml(block.buttonText)}</a>
        </section>
      `;
    })
    .join("");
}

function renderComments(comments: BlogComment[]): string {
  const visible = comments.filter((comment) => comment.status === "visible");
  if (visible.length === 0) {
    return `<div class="comment-item"><p>No comments yet. Ask the first question below.</p></div>`;
  }

  const repliesByParent = new Map<string, BlogComment[]>();
  visible
    .filter((comment) => comment.parentId)
    .forEach((comment) => {
      const key = comment.parentId as string;
      const current = repliesByParent.get(key) || [];
      current.push(comment);
      repliesByParent.set(key, current);
    });

  return visible
    .filter((comment) => !comment.parentId)
    .map((comment) => {
      const replies = repliesByParent.get(comment.id) || [];
      return `
        <article class="comment-item">
          <div class="meta">
            <strong>${escapeHtml(comment.displayName)}</strong>
            <span>${escapeHtml(formatDate(comment.createdAt))}</span>
          </div>
          <p>${escapeHtml(comment.body)}</p>
          ${replies
            .map(
              (reply) => `
                <div class="comment-reply">
                  <div class="meta">
                    <strong>${escapeHtml(reply.displayName)}</strong>
                    <span>${escapeHtml(formatDate(reply.createdAt))}</span>
                  </div>
                  <p>${escapeHtml(reply.body)}</p>
                </div>
              `,
            )
            .join("")}
        </article>
      `;
    })
    .join("");
}

function renderFaqItems(faqs: FaqEntry[]): string {
  if (faqs.length === 0) {
    return `<div class="faq-item"><p>No FAQs have been published yet.</p></div>`;
  }

  return faqs
    .map(
      (faq) => `
        <article class="faq-item">
          <h3>${escapeHtml(faq.question)}</h3>
          <p>${escapeHtml(faq.answer)}</p>
        </article>
      `,
    )
    .join("");
}

function buildFaqJsonLd(url: string, faqs: FaqEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
    url,
  };
}

function buildPagination(basePath: string, page: number, totalPages: number, search: string, category: string) {
  if (totalPages <= 1) return "";

  const makeHref = (nextPage: number) => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (category) params.set("category", category);
    if (nextPage > 1) params.set("page", String(nextPage));
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  };

  return `
    <nav class="pagination" aria-label="Pagination">
      ${Array.from({ length: totalPages }, (_, index) => index + 1)
        .map((index) =>
          index === page
            ? `<span class="active">${index}</span>`
            : `<a href="${makeHref(index)}">${index}</a>`,
        )
        .join("")}
    </nav>
  `;
}

export function renderBlogHubPage(params: {
  settings: SeoSettings;
  author: AuthorProfile;
  posts: BlogPostSummary[];
  categories: { name: string; slug: string }[];
  selectedCategory: string;
  search: string;
  page: number;
  pageSize: number;
  baseUrl: string;
}) {
  const { settings, posts, categories, selectedCategory, search, page, pageSize, baseUrl } = params;
  const totalPages = Math.max(1, Math.ceil(posts.length / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const currentPosts = posts.slice(startIndex, startIndex + pageSize);
  const featuredPost = currentPosts[0];
  const otherPosts = currentPosts.slice(featuredPost ? 1 : 0);
  const canonicalParams = new URLSearchParams();
  if (search) canonicalParams.set("q", search);
  if (selectedCategory) canonicalParams.set("category", selectedCategory);
  if (currentPage > 1) canonicalParams.set("page", String(currentPage));
  const canonicalUrl = canonicalParams.toString()
    ? `${baseUrl}/blog?${canonicalParams.toString()}`
    : `${baseUrl}/blog`;

  const body = `
    <main class="container">
      <section class="hero">
        <div class="hero-copy">
          <span class="eyebrow">InterBridge Insights</span>
          <h1>${escapeHtml(settings.blogTitle)}</h1>
          <p>${escapeHtml(settings.blogDescription)}</p>
        </div>
      </section>

      <section class="toolbar">
        <form method="GET" action="/blog" class="toolbar-row">
          <input class="field search-field" type="search" name="q" value="${escapeHtml(search)}" placeholder="Search sourcing, QC, legal, or trade topics" />
          <select name="category">
            <option value="">All categories</option>
            ${categories
              .map(
                (category) => `
                  <option value="${escapeHtml(category.slug)}" ${category.slug === selectedCategory ? "selected" : ""}>
                    ${escapeHtml(category.name)}
                  </option>
                `,
              )
              .join("")}
          </select>
          <button class="button" type="submit">Search</button>
          ${(search || selectedCategory) ? `<a class="button secondary" href="/blog">Reset</a>` : ""}
        </form>
      </section>

      ${
        featuredPost
          ? `
            <section class="card">
              ${featuredPost.featuredImageUrl ? `<img class="post-image" src="${escapeHtml(featuredPost.featuredImageUrl)}" alt="${escapeHtml(featuredPost.featuredImageAlt || featuredPost.title)}" />` : ""}
              <div class="card-body">
                <div class="chip-row">
                  ${featuredPost.categories
                    .map((category) => `<span class="chip">${escapeHtml(category.name)}</span>`)
                    .join("")}
                  <span class="chip">Featured</span>
                </div>
                <h2><a href="/blog/${escapeHtml(featuredPost.slug)}">${escapeHtml(featuredPost.title)}</a></h2>
                <p>${escapeHtml(featuredPost.excerpt)}</p>
                <div class="meta">
                  <span>${escapeHtml(formatDate(featuredPost.publishedAt))}</span>
                  <span>${featuredPost.commentCount} comments</span>
                  <span>${featuredPost.faqCount} FAQs</span>
                </div>
                <div>
                  <a class="button" href="/blog/${escapeHtml(featuredPost.slug)}">Read article</a>
                </div>
              </div>
            </section>
          `
          : `<section class="card"><div class="card-body"><h2>No articles found</h2><p>Try a different keyword or category.</p></div></section>`
      }

      ${otherPosts.length > 0 ? `<section class="card-grid post-grid" style="margin-top: 24px;">${otherPosts
        .map(
          (post) => `
            <article class="card">
              ${post.featuredImageUrl ? `<img class="post-image" src="${escapeHtml(post.featuredImageUrl)}" alt="${escapeHtml(post.featuredImageAlt || post.title)}" />` : ""}
              <div class="card-body">
                <div class="chip-row">
                  ${post.categories.map((category) => `<span class="chip">${escapeHtml(category.name)}</span>`).join("")}
                </div>
                <h3><a href="/blog/${escapeHtml(post.slug)}">${escapeHtml(post.title)}</a></h3>
                <p>${escapeHtml(post.excerpt)}</p>
                <div class="meta">
                  <span>${escapeHtml(formatDate(post.publishedAt))}</span>
                  <span>${post.commentCount} comments</span>
                </div>
                <div><a class="button secondary" href="/blog/${escapeHtml(post.slug)}">Read more</a></div>
              </div>
            </article>
          `,
        )
        .join("")}</section>` : ""}

      ${buildPagination("/blog", currentPage, totalPages, search, selectedCategory)}
    </main>
  `;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: settings.blogTitle,
      description: settings.blogDescription,
      url: `${baseUrl}/blog`,
    },
  ];

  return renderPageShell({
    title: settings.blogTitle,
    description: settings.blogDescription,
    canonicalUrl,
    ogImageUrl: settings.defaultOgImageUrl,
    jsonLd,
    body,
    activeNav: "blog",
  });
}

export function renderBlogPostPage(params: {
  settings: SeoSettings;
  author: AuthorProfile;
  post: BlogPostDetail;
  baseUrl: string;
  commentState: "success" | "error" | null;
  turnstileSiteKey: string;
}) {
  const { settings, author, post, baseUrl, commentState, turnstileSiteKey } = params;
  const canonicalUrl = post.canonicalUrl || `${baseUrl}/blog/${post.slug}`;
  const ogImage = post.socialImageUrl || post.featuredImageUrl || settings.defaultOgImageUrl;
  const relatedSummary = summarize(post.contentBlocks);
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: author.name,
      description: author.title,
    },
    publisher: {
      "@type": "Organization",
      name: settings.siteTitle,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo.png`,
      },
    },
    image: ogImage ? [ogImage] : undefined,
    mainEntityOfPage: canonicalUrl,
  };

  const faqJsonLd = post.faqs.length > 0 ? buildFaqJsonLd(canonicalUrl, post.faqs) : null;

  const body = `
    <main class="container">
      <section class="hero">
        <div class="hero-copy">
          <a class="eyebrow" href="/blog">Back to Blog</a>
          <h1>${escapeHtml(post.title)}</h1>
          <p class="lead">${escapeHtml(post.excerpt)}</p>
          <div class="meta">
            <span>${escapeHtml(formatDate(post.publishedAt))}</span>
            <span>${post.categories.map((category) => escapeHtml(category.name)).join(" · ")}</span>
            <span>${post.commentCount} comments</span>
          </div>
        </div>
      </section>

      ${post.featuredImageUrl ? `<section class="card" style="margin-bottom: 24px;"><img class="post-image" src="${escapeHtml(post.featuredImageUrl)}" alt="${escapeHtml(post.featuredImageAlt || post.title)}" style="height:min(440px, 52vw);" /></section>` : ""}

      <section class="article-shell">
        <article class="article-main">
          <div class="article-content">
            <p class="lead">${escapeHtml(relatedSummary || post.excerpt)}</p>
            ${renderBlocks(post.contentBlocks)}

            ${
              post.faqs.length > 0
                ? `
                  <section class="block">
                    <h2>Frequently Asked Questions</h2>
                    <div class="faq-list">${renderFaqItems(post.faqs)}</div>
                  </section>
                `
                : ""
            }

            <section class="block">
              <h2>Questions & Comments</h2>
              <div class="comment-list">${renderComments(post.comments)}</div>
            </section>
          </div>
        </article>

        <aside class="article-aside">
          <div class="aside-card">
            <h3>Written by</h3>
            <strong>${escapeHtml(author.name)}</strong>
            ${author.title ? `<p>${escapeHtml(author.title)}</p>` : ""}
            ${author.bio ? `<p>${escapeHtml(author.bio)}</p>` : ""}
          </div>
          ${renderServiceCards(post.relatedServiceIds)}
          <div class="aside-card">
            <h3>Need help with China sourcing?</h3>
            <p>Tell us what you are trying to buy, inspect, or negotiate, and we will point you to the right team.</p>
            <a class="button" href="/#contact">Talk to InterBridge</a>
          </div>
        </aside>
      </section>

      <section style="margin-top: 24px;">
        ${commentState === "success" ? `<div class="status-banner status-success">Your comment has been posted.</div>` : ""}
        ${commentState === "error" ? `<div class="status-banner status-error">We could not post your comment. Please try again.</div>` : ""}
        <form class="form" method="POST" action="/api/blog/${escapeHtml(post.slug)}/comments">
          <h2>Ask a question on this article</h2>
          <p>Your comment will appear on the page right away unless it is flagged as spam.</p>
          <div class="two-col">
            <input class="field" type="text" name="displayName" placeholder="Your name" required />
            <input class="field" type="email" name="email" placeholder="Email address" />
          </div>
          <textarea name="body" placeholder="Share your question or experience..." required></textarea>
          <input type="hidden" name="redirectTo" value="/blog/${escapeHtml(post.slug)}" />
          ${turnstileSiteKey ? `<div class="cf-turnstile" data-sitekey="${escapeHtml(turnstileSiteKey)}"></div>` : ""}
          <button class="button" type="submit">Post comment</button>
        </form>
      </section>
    </main>
    ${turnstileSiteKey ? `<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>` : ""}
  `;

  return renderPageShell({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    canonicalUrl,
    ogImageUrl: ogImage,
    jsonLd: faqJsonLd ? [articleJsonLd, faqJsonLd] : [articleJsonLd],
    body,
    pageTitle: post.title,
    activeNav: "blog",
  });
}

export function renderFaqPage(params: {
  settings: SeoSettings;
  faqs: FaqEntry[];
  baseUrl: string;
}) {
  const { settings, faqs, baseUrl } = params;
  const grouped = new Map<string, FaqEntry[]>();

  faqs.forEach((faq) => {
    const key = faq.category || "General";
    const current = grouped.get(key) || [];
    current.push(faq);
    grouped.set(key, current);
  });

  const body = `
    <main class="container">
      <section class="hero">
        <div class="hero-copy">
          <span class="eyebrow">FAQ</span>
          <h1>${escapeHtml(settings.faqTitle)}</h1>
          <p>${escapeHtml(settings.faqDescription)}</p>
        </div>
      </section>
      <section class="card-grid" style="margin-top: 8px;">
        ${Array.from(grouped.entries())
          .map(
            ([category, items]) => `
              <section class="card">
                <div class="card-body">
                  <h2>${escapeHtml(category)}</h2>
                  <div class="faq-list">${renderFaqItems(items)}</div>
                </div>
              </section>
            `,
          )
          .join("")}
      </section>
    </main>
  `;

  return renderPageShell({
    title: settings.faqTitle,
    description: settings.faqDescription,
    canonicalUrl: `${baseUrl}/faq`,
    ogImageUrl: settings.defaultOgImageUrl,
    jsonLd: [buildFaqJsonLd(`${baseUrl}/faq`, faqs)],
    body,
    activeNav: "faq",
  });
}
