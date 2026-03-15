import { z } from "zod";

export const blogPostStatuses = ["draft", "scheduled", "published"] as const;
export type BlogPostStatus = (typeof blogPostStatuses)[number];

export const blogCommentStatuses = ["visible", "hidden", "spam"] as const;
export type BlogCommentStatus = (typeof blogCommentStatuses)[number];

export const faqScopes = ["global", "post"] as const;
export type FaqScope = (typeof faqScopes)[number];

export const mediaAssetKinds = ["image"] as const;
export type MediaAssetKind = (typeof mediaAssetKinds)[number];

export const blogBlockTypes = ["rich_text", "image", "quote", "cta"] as const;
export type BlogBlockType = (typeof blogBlockTypes)[number];

const richTextBlockSchema = z.object({
  id: z.string().min(1),
  type: z.literal("rich_text"),
  title: z.string().trim().max(160).optional(),
  body: z.string().trim().min(1),
});

const imageBlockSchema = z.object({
  id: z.string().min(1),
  type: z.literal("image"),
  assetId: z.string().trim().min(1).nullable().optional(),
  src: z.string().trim().url(),
  alt: z.string().trim().min(1),
  caption: z.string().trim().max(240).optional(),
});

const quoteBlockSchema = z.object({
  id: z.string().min(1),
  type: z.literal("quote"),
  quote: z.string().trim().min(1),
  attribution: z.string().trim().max(160).optional(),
});

const ctaBlockSchema = z.object({
  id: z.string().min(1),
  type: z.literal("cta"),
  heading: z.string().trim().min(1).max(160),
  body: z.string().trim().min(1).max(400),
  buttonText: z.string().trim().min(1).max(80),
  buttonLink: z.string().trim().min(1).max(240),
});

export const blogContentBlockSchema = z.discriminatedUnion("type", [
  richTextBlockSchema,
  imageBlockSchema,
  quoteBlockSchema,
  ctaBlockSchema,
]);

export type BlogContentBlock = z.infer<typeof blogContentBlockSchema>;

const arrayFromCsv = z
  .union([z.array(z.string()), z.string(), z.undefined(), z.null()])
  .transform((value) => {
    if (Array.isArray(value)) {
      return value.map((item) => item.trim()).filter(Boolean);
    }

    if (typeof value === "string") {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [];
  });

export const blogCategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(80),
  slug: z.string().trim().min(1).max(120),
  description: z.string().trim().max(280).default(""),
  visible: z.boolean().default(true),
  order: z.number().int().default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type BlogCategory = z.infer<typeof blogCategorySchema>;

export const faqEntrySchema = z.object({
  id: z.string().min(1),
  scope: z.enum(faqScopes),
  postId: z.string().trim().min(1).nullable(),
  category: z.string().trim().max(80).default("General"),
  question: z.string().trim().min(1).max(220),
  answer: z.string().trim().min(1).max(4000),
  order: z.number().int().default(0),
  visible: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type FaqEntry = z.infer<typeof faqEntrySchema>;

export const mediaAssetSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(mediaAssetKinds),
  fileName: z.string().trim().min(1),
  storagePath: z.string().trim().min(1),
  url: z.string().trim().url(),
  alt: z.string().trim().max(160).default(""),
  mimeType: z.string().trim().min(1),
  size: z.number().int().nonnegative(),
  width: z.number().int().nullable().optional(),
  height: z.number().int().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type MediaAsset = z.infer<typeof mediaAssetSchema>;

export const authorProfileSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(120),
  title: z.string().trim().max(120).default(""),
  bio: z.string().trim().max(1200).default(""),
  avatarUrl: z.string().trim().url().nullable(),
  email: z.string().trim().email().nullable(),
  updatedAt: z.date(),
});

export type AuthorProfile = z.infer<typeof authorProfileSchema>;

export const seoSettingsSchema = z.object({
  id: z.string().min(1),
  siteTitle: z.string().trim().min(1).max(120),
  siteDescription: z.string().trim().min(1).max(280),
  siteKeywords: z.array(z.string().trim().min(1).max(80)).default([]),
  blogTitle: z.string().trim().min(1).max(120),
  blogDescription: z.string().trim().min(1).max(280),
  faqTitle: z.string().trim().min(1).max(120),
  faqDescription: z.string().trim().min(1).max(280),
  defaultOgImageUrl: z.string().trim().url().nullable(),
  updatedAt: z.date(),
});

export type SeoSettings = z.infer<typeof seoSettingsSchema>;

export const blogPostSchema = z.object({
  id: z.string().min(1),
  status: z.enum(blogPostStatuses),
  title: z.string().trim().min(1).max(180),
  slug: z.string().trim().min(1).max(160),
  excerpt: z.string().trim().min(1).max(320),
  featuredImageUrl: z.string().trim().url().nullable(),
  featuredImageAlt: z.string().trim().max(160).default(""),
  categoryIds: z.array(z.string().trim().min(1)).default([]),
  tags: z.array(z.string().trim().min(1).max(80)).default([]),
  contentBlocks: z.array(blogContentBlockSchema).min(1),
  relatedServiceIds: z.array(z.string().trim().min(1)).default([]),
  faqIds: z.array(z.string().trim().min(1)).default([]),
  featured: z.boolean().default(false),
  seoTitle: z.string().trim().max(120).default(""),
  seoDescription: z.string().trim().max(280).default(""),
  canonicalUrl: z.string().trim().url().nullable(),
  socialImageUrl: z.string().trim().url().nullable(),
  socialImageAlt: z.string().trim().max(160).default(""),
  createdAt: z.date(),
  updatedAt: z.date(),
  publishedAt: z.date().nullable(),
  scheduledFor: z.date().nullable(),
});

export type BlogPost = z.infer<typeof blogPostSchema>;

export const blogCommentSchema = z.object({
  id: z.string().min(1),
  postId: z.string().min(1),
  parentId: z.string().trim().min(1).nullable(),
  displayName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().nullable(),
  body: z.string().trim().min(1).max(1200),
  status: z.enum(blogCommentStatuses),
  isAdminReply: z.boolean().default(false),
  spamScore: z.number().min(0).max(1).default(0),
  ipHash: z.string().trim().min(1).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type BlogComment = z.infer<typeof blogCommentSchema>;

export const blogPostInputSchema = z.object({
  title: z.string().trim().min(1).max(180),
  slug: z.string().trim().min(1).max(160),
  excerpt: z.string().trim().min(1).max(320),
  status: z.enum(blogPostStatuses),
  featuredImageUrl: z.string().trim().url().nullable().optional(),
  featuredImageAlt: z.string().trim().max(160).optional(),
  categoryIds: arrayFromCsv,
  tags: arrayFromCsv,
  contentBlocks: z.array(blogContentBlockSchema).min(1),
  relatedServiceIds: arrayFromCsv,
  faqIds: z.array(z.string().trim().min(1)).default([]),
  featured: z.boolean().default(false),
  seoTitle: z.string().trim().max(120).optional(),
  seoDescription: z.string().trim().max(280).optional(),
  canonicalUrl: z.string().trim().url().nullable().optional(),
  socialImageUrl: z.string().trim().url().nullable().optional(),
  socialImageAlt: z.string().trim().max(160).optional(),
  scheduledFor: z.union([z.string(), z.date(), z.null(), z.undefined()]).optional(),
});

export type BlogPostInput = z.infer<typeof blogPostInputSchema>;

export const blogCategoryInputSchema = z.object({
  name: z.string().trim().min(1).max(80),
  slug: z.string().trim().min(1).max(120),
  description: z.string().trim().max(280).default(""),
  visible: z.boolean().default(true),
  order: z.number().int().default(0),
});

export type BlogCategoryInput = z.infer<typeof blogCategoryInputSchema>;

export const faqEntryInputSchema = z.object({
  scope: z.enum(faqScopes),
  postId: z.string().trim().min(1).nullable().optional(),
  category: z.string().trim().max(80).default("General"),
  question: z.string().trim().min(1).max(220),
  answer: z.string().trim().min(1).max(4000),
  order: z.number().int().default(0),
  visible: z.boolean().default(true),
});

export type FaqEntryInput = z.infer<typeof faqEntryInputSchema>;

export const mediaAssetInputSchema = z.object({
  alt: z.string().trim().max(160).default(""),
});

export type MediaAssetInput = z.infer<typeof mediaAssetInputSchema>;

export const blogCommentInputSchema = z.object({
  displayName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().optional().nullable(),
  body: z.string().trim().min(1).max(1200),
  turnstileToken: z.string().trim().optional(),
});

export type BlogCommentInput = z.infer<typeof blogCommentInputSchema>;

export const adminReplyInputSchema = z.object({
  body: z.string().trim().min(1).max(1200),
});

export type AdminReplyInput = z.infer<typeof adminReplyInputSchema>;

export const authorProfileInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  title: z.string().trim().max(120).default(""),
  bio: z.string().trim().max(1200).default(""),
  avatarUrl: z.string().trim().url().nullable().optional(),
  email: z.string().trim().email().nullable().optional(),
});

export type AuthorProfileInput = z.infer<typeof authorProfileInputSchema>;

export const seoSettingsInputSchema = z.object({
  siteTitle: z.string().trim().min(1).max(120),
  siteDescription: z.string().trim().min(1).max(280),
  siteKeywords: arrayFromCsv,
  blogTitle: z.string().trim().min(1).max(120),
  blogDescription: z.string().trim().min(1).max(280),
  faqTitle: z.string().trim().min(1).max(120),
  faqDescription: z.string().trim().min(1).max(280),
  defaultOgImageUrl: z.string().trim().url().nullable().optional(),
});

export type SeoSettingsInput = z.infer<typeof seoSettingsInputSchema>;

export interface BlogPostSummary extends BlogPost {
  categories: BlogCategory[];
  faqCount: number;
  commentCount: number;
}

export interface BlogPostDetail extends BlogPostSummary {
  faqs: FaqEntry[];
  comments: BlogComment[];
}

export function slugifyText(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
}
