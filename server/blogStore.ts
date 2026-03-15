import { randomUUID } from "crypto";
import { Firestore, Timestamp } from "@google-cloud/firestore";
import {
  type AdminReplyInput,
  type AuthorProfile,
  type AuthorProfileInput,
  authorProfileSchema,
  type BlogCategory,
  type BlogCategoryInput,
  blogCategorySchema,
  type BlogComment,
  type BlogCommentInput,
  blogCommentSchema,
  type BlogPost,
  type BlogPostDetail,
  type BlogPostInput,
  type BlogPostSummary,
  blogPostSchema,
  type FaqEntry,
  type FaqEntryInput,
  faqEntrySchema,
  type MediaAsset,
  mediaAssetSchema,
  type SeoSettings,
  type SeoSettingsInput,
  seoSettingsSchema,
} from "@shared/blog";

const firestore = new Firestore();

const collections = {
  posts: "blog_posts",
  categories: "blog_categories",
  faqs: "faq_entries",
  comments: "blog_comments",
  media: "media_assets",
  authorProfile: "author_profile",
  seoSettings: "seo_settings",
} as const;

const primaryAuthorId = "primary";
const primarySeoSettingsId = "primary";

function toDate(value: unknown, fallback = new Date()): Date {
  if (value instanceof Date) return value;
  if (value instanceof Timestamp) return value.toDate();

  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  return fallback;
}

function toNullableDate(value: unknown): Date | null {
  if (value === null || value === undefined) return null;
  return toDate(value);
}

function toStringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function toNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function toBooleanValue(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function toNumberValue(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean);
}

function parse<T>(schema: { safeParse: (value: unknown) => { success: boolean; data: T } }, value: unknown, fallback: T): T {
  const parsed = schema.safeParse(value);
  return parsed.success ? parsed.data : fallback;
}

function sortByUpdatedDesc<T extends { updatedAt: Date }>(rows: T[]): T[] {
  return rows.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

function sortByCreatedAsc<T extends { createdAt: Date }>(rows: T[]): T[] {
  return rows.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

function parseCategory(id: string, data: FirebaseFirestore.DocumentData): BlogCategory {
  return parse(
    blogCategorySchema,
    {
      id,
      name: toStringValue(data.name),
      slug: toStringValue(data.slug),
      description: toStringValue(data.description),
      visible: toBooleanValue(data.visible, true),
      order: toNumberValue(data.order),
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    },
    {
      id,
      name: "",
      slug: id,
      description: "",
      visible: true,
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  );
}

function parsePost(id: string, data: FirebaseFirestore.DocumentData): BlogPost {
  return parse(
    blogPostSchema,
    {
      id,
      status: toStringValue(data.status, "draft"),
      title: toStringValue(data.title),
      slug: toStringValue(data.slug),
      excerpt: toStringValue(data.excerpt),
      featuredImageUrl: toNullableString(data.featuredImageUrl),
      featuredImageAlt: toStringValue(data.featuredImageAlt),
      categoryIds: toStringArray(data.categoryIds),
      tags: toStringArray(data.tags),
      contentBlocks: Array.isArray(data.contentBlocks) ? data.contentBlocks : [],
      relatedServiceIds: toStringArray(data.relatedServiceIds),
      faqIds: toStringArray(data.faqIds),
      featured: toBooleanValue(data.featured, false),
      seoTitle: toStringValue(data.seoTitle),
      seoDescription: toStringValue(data.seoDescription),
      canonicalUrl: toNullableString(data.canonicalUrl),
      socialImageUrl: toNullableString(data.socialImageUrl),
      socialImageAlt: toStringValue(data.socialImageAlt),
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
      publishedAt: toNullableDate(data.publishedAt),
      scheduledFor: toNullableDate(data.scheduledFor),
    },
    {
      id,
      status: "draft",
      title: "",
      slug: id,
      excerpt: "",
      featuredImageUrl: null,
      featuredImageAlt: "",
      categoryIds: [],
      tags: [],
      contentBlocks: [],
      relatedServiceIds: [],
      faqIds: [],
      featured: false,
      seoTitle: "",
      seoDescription: "",
      canonicalUrl: null,
      socialImageUrl: null,
      socialImageAlt: "",
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: null,
      scheduledFor: null,
    },
  );
}

function parseFaq(id: string, data: FirebaseFirestore.DocumentData): FaqEntry {
  return parse(
    faqEntrySchema,
    {
      id,
      scope: toStringValue(data.scope, "global"),
      postId: toNullableString(data.postId),
      category: toStringValue(data.category, "General"),
      question: toStringValue(data.question),
      answer: toStringValue(data.answer),
      order: toNumberValue(data.order),
      visible: toBooleanValue(data.visible, true),
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    },
    {
      id,
      scope: "global",
      postId: null,
      category: "General",
      question: "",
      answer: "",
      order: 0,
      visible: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  );
}

function parseComment(id: string, data: FirebaseFirestore.DocumentData): BlogComment {
  return parse(
    blogCommentSchema,
    {
      id,
      postId: toStringValue(data.postId),
      parentId: toNullableString(data.parentId),
      displayName: toStringValue(data.displayName),
      email: toNullableString(data.email),
      body: toStringValue(data.body),
      status: toStringValue(data.status, "visible"),
      isAdminReply: toBooleanValue(data.isAdminReply, false),
      spamScore: toNumberValue(data.spamScore, 0),
      ipHash: toNullableString(data.ipHash),
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    },
    {
      id,
      postId: "",
      parentId: null,
      displayName: "",
      email: null,
      body: "",
      status: "visible",
      isAdminReply: false,
      spamScore: 0,
      ipHash: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  );
}

function parseMedia(id: string, data: FirebaseFirestore.DocumentData): MediaAsset {
  return parse(
    mediaAssetSchema,
    {
      id,
      kind: toStringValue(data.kind, "image"),
      fileName: toStringValue(data.fileName),
      storagePath: toStringValue(data.storagePath),
      url: toStringValue(data.url),
      alt: toStringValue(data.alt),
      mimeType: toStringValue(data.mimeType),
      size: toNumberValue(data.size),
      width: data.width === null || data.width === undefined ? null : toNumberValue(data.width),
      height: data.height === null || data.height === undefined ? null : toNumberValue(data.height),
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    },
    {
      id,
      kind: "image",
      fileName: "",
      storagePath: "",
      url: "",
      alt: "",
      mimeType: "",
      size: 0,
      width: null,
      height: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  );
}

function parseAuthorProfile(id: string, data: FirebaseFirestore.DocumentData): AuthorProfile {
  return parse(
    authorProfileSchema,
    {
      id,
      name: toStringValue(data.name, "InterBridge Editorial Team"),
      title: toStringValue(data.title, "China sourcing and trade advisory team"),
      bio: toStringValue(
        data.bio,
        "InterBridge helps businesses source, inspect, negotiate, and operate more confidently in China.",
      ),
      avatarUrl: toNullableString(data.avatarUrl),
      email: toNullableString(data.email),
      updatedAt: toDate(data.updatedAt),
    },
    {
      id,
      name: "InterBridge Editorial Team",
      title: "China sourcing and trade advisory team",
      bio: "InterBridge helps businesses source, inspect, negotiate, and operate more confidently in China.",
      avatarUrl: null,
      email: null,
      updatedAt: new Date(),
    },
  );
}

function parseSeoSettings(id: string, data: FirebaseFirestore.DocumentData): SeoSettings {
  return parse(
    seoSettingsSchema,
    {
      id,
      siteTitle: toStringValue(data.siteTitle, "InterBridge Trans & Trade"),
      siteDescription: toStringValue(
        data.siteDescription,
        "Bilingual sourcing, quality control, translation, legal, and manufacturing support for companies working with China.",
      ),
      siteKeywords: toStringArray(data.siteKeywords),
      blogTitle: toStringValue(data.blogTitle, "InterBridge Insights"),
      blogDescription: toStringValue(
        data.blogDescription,
        "Practical articles, sourcing guidance, and China market insights for importers and operators.",
      ),
      faqTitle: toStringValue(data.faqTitle, "InterBridge FAQ"),
      faqDescription: toStringValue(
        data.faqDescription,
        "Answers to common sourcing, quality control, translation, legal, and business setup questions in China.",
      ),
      defaultOgImageUrl: toNullableString(data.defaultOgImageUrl),
      updatedAt: toDate(data.updatedAt),
    },
    {
      id,
      siteTitle: "InterBridge Trans & Trade",
      siteDescription:
        "Bilingual sourcing, quality control, translation, legal, and manufacturing support for companies working with China.",
      siteKeywords: [],
      blogTitle: "InterBridge Insights",
      blogDescription:
        "Practical articles, sourcing guidance, and China market insights for importers and operators.",
      faqTitle: "InterBridge FAQ",
      faqDescription:
        "Answers to common sourcing, quality control, translation, legal, and business setup questions in China.",
      defaultOgImageUrl: null,
      updatedAt: new Date(),
    },
  );
}

function buildPostDates(input: BlogPostInput, existing?: BlogPost) {
  const now = new Date();

  if (input.status === "published") {
    return {
      publishedAt: existing?.publishedAt ?? now,
      scheduledFor: null,
    };
  }

  if (input.status === "scheduled") {
    const scheduledFor = input.scheduledFor ? toDate(input.scheduledFor) : null;
    if (!scheduledFor) {
      throw new Error("Scheduled posts require a publish date.");
    }

    return {
      publishedAt: scheduledFor,
      scheduledFor,
    };
  }

  return {
    publishedAt: null,
    scheduledFor: null,
  };
}

function isPostPublic(post: BlogPost, now = new Date()): boolean {
  if (post.status === "published") return true;
  return post.status === "scheduled" && !!post.publishedAt && post.publishedAt <= now;
}

export interface ListPostsOptions {
  includeUnpublished?: boolean;
  featuredOnly?: boolean;
  categorySlug?: string;
  search?: string;
  limit?: number;
}

export class BlogStore {
  async getSeoSettings(): Promise<SeoSettings> {
    const doc = await firestore.collection(collections.seoSettings).doc(primarySeoSettingsId).get();
    if (!doc.exists) {
      return parseSeoSettings(primarySeoSettingsId, {});
    }

    return parseSeoSettings(doc.id, doc.data() || {});
  }

  async upsertSeoSettings(input: SeoSettingsInput): Promise<SeoSettings> {
    const payload = {
      ...input,
      updatedAt: new Date(),
    };

    await firestore.collection(collections.seoSettings).doc(primarySeoSettingsId).set(payload, { merge: true });
    return this.getSeoSettings();
  }

  async getAuthorProfile(): Promise<AuthorProfile> {
    const doc = await firestore.collection(collections.authorProfile).doc(primaryAuthorId).get();
    if (!doc.exists) {
      return parseAuthorProfile(primaryAuthorId, {});
    }

    return parseAuthorProfile(doc.id, doc.data() || {});
  }

  async upsertAuthorProfile(input: AuthorProfileInput): Promise<AuthorProfile> {
    const payload = {
      ...input,
      updatedAt: new Date(),
    };

    await firestore.collection(collections.authorProfile).doc(primaryAuthorId).set(payload, { merge: true });
    return this.getAuthorProfile();
  }

  async listCategories(visibleOnly = false): Promise<BlogCategory[]> {
    const snapshot = await firestore.collection(collections.categories).get();
    const categories = snapshot.docs.map((doc) => parseCategory(doc.id, doc.data()));
    const filtered = visibleOnly ? categories.filter((item) => item.visible) : categories;
    return filtered.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  }

  async getCategoryBySlug(slug: string): Promise<BlogCategory | undefined> {
    const snapshot = await firestore.collection(collections.categories).where("slug", "==", slug).limit(1).get();
    const doc = snapshot.docs[0];
    if (!doc) return undefined;
    return parseCategory(doc.id, doc.data());
  }

  async saveCategory(input: BlogCategoryInput, id = randomUUID()): Promise<BlogCategory> {
    const now = new Date();
    const ref = firestore.collection(collections.categories).doc(id);
    const existing = await ref.get();

    const payload = {
      ...input,
      createdAt: existing.exists ? toDate((existing.data() || {}).createdAt) : now,
      updatedAt: now,
    };

    await ref.set(payload, { merge: true });
    const saved = await ref.get();
    return parseCategory(saved.id, saved.data() || {});
  }

  async deleteCategory(id: string): Promise<void> {
    await firestore.collection(collections.categories).doc(id).delete();
  }

  async getPostById(id: string): Promise<BlogPost | undefined> {
    const doc = await firestore.collection(collections.posts).doc(id).get();
    if (!doc.exists) return undefined;
    return parsePost(doc.id, doc.data() || {});
  }

  async getPostBySlug(slug: string, includeUnpublished = false): Promise<BlogPost | undefined> {
    const snapshot = await firestore.collection(collections.posts).where("slug", "==", slug).limit(1).get();
    const doc = snapshot.docs[0];
    if (!doc) return undefined;
    const post = parsePost(doc.id, doc.data());
    if (!includeUnpublished && !isPostPublic(post)) {
      return undefined;
    }
    return post;
  }

  async savePost(input: BlogPostInput, id = randomUUID()): Promise<BlogPost> {
    const now = new Date();
    const ref = firestore.collection(collections.posts).doc(id);
    const existing = await ref.get();
    const existingPost = existing.exists ? parsePost(existing.id, existing.data() || {}) : undefined;
    const sameSlug = await firestore.collection(collections.posts).where("slug", "==", input.slug).limit(2).get();
    const duplicate = sameSlug.docs.find((doc) => doc.id !== id);
    if (duplicate) {
      throw new Error("A post with that slug already exists.");
    }

    const dates = buildPostDates(input, existingPost);
    const payload = {
      ...input,
      featuredImageUrl: input.featuredImageUrl ?? null,
      featuredImageAlt: input.featuredImageAlt ?? "",
      seoTitle: input.seoTitle ?? "",
      seoDescription: input.seoDescription ?? "",
      canonicalUrl: input.canonicalUrl ?? null,
      socialImageUrl: input.socialImageUrl ?? null,
      socialImageAlt: input.socialImageAlt ?? "",
      categoryIds: input.categoryIds,
      tags: input.tags,
      relatedServiceIds: input.relatedServiceIds,
      faqIds: input.faqIds,
      createdAt: existingPost?.createdAt ?? now,
      updatedAt: now,
      publishedAt: dates.publishedAt,
      scheduledFor: dates.scheduledFor,
    };

    await ref.set(payload, { merge: true });
    const saved = await ref.get();
    return parsePost(saved.id, saved.data() || {});
  }

  async deletePost(id: string): Promise<void> {
    await firestore.collection(collections.posts).doc(id).delete();
  }

  async listPosts(options: ListPostsOptions = {}): Promise<BlogPostSummary[]> {
    const now = new Date();
    const [postsSnapshot, categories, faqs, comments] = await Promise.all([
      firestore.collection(collections.posts).get(),
      this.listCategories(false),
      this.listFaqs({ visibleOnly: false }),
      this.listComments({ visibleOnly: false }),
    ]);

    let posts = postsSnapshot.docs.map((doc) => parsePost(doc.id, doc.data()));

    if (!options.includeUnpublished) {
      posts = posts.filter((post) => isPostPublic(post, now));
    }

    if (options.featuredOnly) {
      posts = posts.filter((post) => post.featured);
    }

    if (options.categorySlug) {
      const category = categories.find((item) => item.slug === options.categorySlug);
      posts = category ? posts.filter((post) => post.categoryIds.includes(category.id)) : [];
    }

    if (options.search) {
      const needle = options.search.trim().toLowerCase();
      posts = posts.filter((post) => {
        const haystack = [
          post.title,
          post.excerpt,
          post.tags.join(" "),
          categories
            .filter((category) => post.categoryIds.includes(category.id))
            .map((category) => category.name)
            .join(" "),
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(needle);
      });
    }

    posts = posts.sort((a, b) => {
      const left = a.publishedAt ?? a.updatedAt;
      const right = b.publishedAt ?? b.updatedAt;
      return right.getTime() - left.getTime();
    });

    if (options.limit) {
      posts = posts.slice(0, options.limit);
    }

    return posts.map((post) => {
      const categoriesForPost = categories.filter((item) => post.categoryIds.includes(item.id));
      const faqCount = faqs.filter((item) => item.scope === "post" && item.postId === post.id && item.visible).length;
      const commentCount = comments.filter((item) => item.postId === post.id && item.status === "visible").length;

      return {
        ...post,
        categories: categoriesForPost,
        faqCount,
        commentCount,
      };
    });
  }

  async getPostDetailBySlug(slug: string, includeUnpublished = false): Promise<BlogPostDetail | undefined> {
    const post = await this.getPostBySlug(slug, includeUnpublished);
    if (!post) return undefined;

    const [categories, faqs, comments] = await Promise.all([
      this.listCategories(false),
      this.listFaqs({ postId: post.id, visibleOnly: !includeUnpublished }),
      this.listComments({ postId: post.id, visibleOnly: !includeUnpublished }),
    ]);

    return {
      ...post,
      categories: categories.filter((item) => post.categoryIds.includes(item.id)),
      faqCount: faqs.length,
      commentCount: comments.filter((item) => item.status === "visible").length,
      faqs,
      comments,
    };
  }

  async listFaqs(options: { scope?: "global" | "post"; postId?: string; visibleOnly?: boolean } = {}): Promise<FaqEntry[]> {
    const snapshot = await firestore.collection(collections.faqs).get();
    let items = snapshot.docs.map((doc) => parseFaq(doc.id, doc.data()));

    if (options.scope) {
      items = items.filter((faq) => faq.scope === options.scope);
    }

    if (options.postId !== undefined) {
      items = items.filter((faq) => faq.postId === options.postId);
    }

    if (options.visibleOnly) {
      items = items.filter((faq) => faq.visible);
    }

    return items.sort((a, b) => a.order - b.order || a.question.localeCompare(b.question));
  }

  async getFaqById(id: string): Promise<FaqEntry | undefined> {
    const doc = await firestore.collection(collections.faqs).doc(id).get();
    if (!doc.exists) return undefined;
    return parseFaq(doc.id, doc.data() || {});
  }

  async saveFaq(input: FaqEntryInput, id = randomUUID()): Promise<FaqEntry> {
    const now = new Date();
    const ref = firestore.collection(collections.faqs).doc(id);
    const existing = await ref.get();

    const payload = {
      ...input,
      postId: input.scope === "post" ? input.postId ?? null : null,
      createdAt: existing.exists ? toDate((existing.data() || {}).createdAt) : now,
      updatedAt: now,
    };

    await ref.set(payload, { merge: true });
    const saved = await ref.get();
    return parseFaq(saved.id, saved.data() || {});
  }

  async deleteFaq(id: string): Promise<void> {
    await firestore.collection(collections.faqs).doc(id).delete();
  }

  async listComments(options: { postId?: string; visibleOnly?: boolean } = {}): Promise<BlogComment[]> {
    const snapshot = await firestore.collection(collections.comments).get();
    let comments = snapshot.docs.map((doc) => parseComment(doc.id, doc.data()));

    if (options.postId) {
      comments = comments.filter((item) => item.postId === options.postId);
    }

    if (options.visibleOnly) {
      comments = comments.filter((item) => item.status === "visible");
    }

    return sortByCreatedAsc(comments);
  }

  async createComment(
    postId: string,
    input: BlogCommentInput,
    options: { spamScore: number; ipHash: string | null },
  ): Promise<BlogComment> {
    const now = new Date();
    const id = randomUUID();
    const comment: BlogComment = {
      id,
      postId,
      parentId: null,
      displayName: input.displayName,
      email: input.email ?? null,
      body: input.body,
      status: options.spamScore >= 0.85 ? "spam" : "visible",
      isAdminReply: false,
      spamScore: options.spamScore,
      ipHash: options.ipHash,
      createdAt: now,
      updatedAt: now,
    };

    await firestore.collection(collections.comments).doc(id).set(comment);
    return comment;
  }

  async createAdminReply(parentId: string, input: AdminReplyInput): Promise<BlogComment> {
    const parent = await firestore.collection(collections.comments).doc(parentId).get();
    if (!parent.exists) {
      throw new Error("Comment not found.");
    }

    const parentComment = parseComment(parent.id, parent.data() || {});
    const now = new Date();
    const reply: BlogComment = {
      id: randomUUID(),
      postId: parentComment.postId,
      parentId: parentComment.id,
      displayName: "InterBridge Team",
      email: null,
      body: input.body,
      status: "visible",
      isAdminReply: true,
      spamScore: 0,
      ipHash: null,
      createdAt: now,
      updatedAt: now,
    };

    await firestore.collection(collections.comments).doc(reply.id).set(reply);
    return reply;
  }

  async updateCommentStatus(id: string, status: BlogComment["status"]): Promise<BlogComment | undefined> {
    const ref = firestore.collection(collections.comments).doc(id);
    const existing = await ref.get();
    if (!existing.exists) return undefined;

    await ref.set(
      {
        status,
        updatedAt: new Date(),
      },
      { merge: true },
    );

    const saved = await ref.get();
    return parseComment(saved.id, saved.data() || {});
  }

  async listMediaAssets(): Promise<MediaAsset[]> {
    const snapshot = await firestore.collection(collections.media).get();
    return sortByUpdatedDesc(snapshot.docs.map((doc) => parseMedia(doc.id, doc.data())));
  }

  async createMediaAsset(
    asset: Omit<MediaAsset, "id" | "createdAt" | "updatedAt">,
    id = randomUUID(),
  ): Promise<MediaAsset> {
    const now = new Date();
    const payload = {
      ...asset,
      createdAt: now,
      updatedAt: now,
    };

    await firestore.collection(collections.media).doc(id).set(payload);
    const saved = await firestore.collection(collections.media).doc(id).get();
    return parseMedia(saved.id, saved.data() || {});
  }

  async updateMediaAlt(id: string, alt: string): Promise<MediaAsset | undefined> {
    const ref = firestore.collection(collections.media).doc(id);
    const existing = await ref.get();
    if (!existing.exists) return undefined;

    await ref.set(
      {
        alt,
        updatedAt: new Date(),
      },
      { merge: true },
    );

    const saved = await ref.get();
    return parseMedia(saved.id, saved.data() || {});
  }

  async deleteMediaAsset(id: string): Promise<MediaAsset | undefined> {
    const ref = firestore.collection(collections.media).doc(id);
    const existing = await ref.get();
    if (!existing.exists) return undefined;
    const asset = parseMedia(existing.id, existing.data() || {});
    await ref.delete();
    return asset;
  }
}

export const blogStore = new BlogStore();
export { isPostPublic };
