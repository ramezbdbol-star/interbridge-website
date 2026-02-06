import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const siteContent = pgTable("site_content", {
  id: varchar("id").primaryKey(),
  content: text("content").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertContentSchema = createInsertSchema(siteContent).pick({
  id: true,
  content: true,
});

export type InsertContent = z.infer<typeof insertContentSchema>;
export type SiteContent = typeof siteContent.$inferSelect;

export const adminSessions = pgTable("admin_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const insertSessionSchema = createInsertSchema(adminSessions).omit({
  id: true,
  createdAt: true,
});

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type AdminSession = typeof adminSessions.$inferSelect;

export const contactRequests = pgTable("contact_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  interestedIn: text("interested_in").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertContactRequestSchema = createInsertSchema(contactRequests).omit({
  id: true,
  createdAt: true,
});

export type InsertContactRequest = z.infer<typeof insertContactRequestSchema>;
export type ContactRequest = typeof contactRequests.$inferSelect;

export const customerReviews = pgTable("customer_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerName: text("customer_name").notNull(),
  companyName: text("company_name"),
  country: text("country"),
  serviceUsed: text("service_used").notNull(),
  rating: text("rating").notNull(),
  reviewText: text("review_text").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
});

export const insertReviewSchema = createInsertSchema(customerReviews).omit({
  id: true,
  createdAt: true,
  reviewedAt: true,
  status: true,
});

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type CustomerReview = typeof customerReviews.$inferSelect;

export const disputeCases = pgTable("dispute_cases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  disputeType: text("dispute_type").notNull(),
  amountAtRisk: text("amount_at_risk").notNull(),
  supplierInfo: text("supplier_info"),
  description: text("description").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDisputeCaseSchema = createInsertSchema(disputeCases).omit({
  id: true,
  createdAt: true,
  status: true,
});

export type InsertDisputeCase = z.infer<typeof insertDisputeCaseSchema>;
export type DisputeCase = typeof disputeCases.$inferSelect;

export const furnitureConsultations = pgTable("furniture_consultations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  projectType: text("project_type").notNull(),
  budgetRange: text("budget_range").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFurnitureConsultationSchema = createInsertSchema(furnitureConsultations).omit({
  id: true,
  createdAt: true,
  status: true,
});

export type InsertFurnitureConsultation = z.infer<typeof insertFurnitureConsultationSchema>;
export type FurnitureConsultation = typeof furnitureConsultations.$inferSelect;
