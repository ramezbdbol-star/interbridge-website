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

export const bookingRequests = pgTable("booking_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  status: text("status").notNull().default("pending"),
  name: text("name"),
  email: text("email"),
  phone: text("phone"),
  purpose: text("purpose"),
  notes: text("notes"),
  needsMeetLink: boolean("needs_meet_link").notNull().default(false),
  isUrgent: boolean("is_urgent").notNull().default(false),
  visitorTimezone: text("visitor_timezone").notNull(),
  startAtUtc: timestamp("start_at_utc").notNull(),
  endAtUtc: timestamp("end_at_utc").notNull(),
  holdEventId: text("hold_event_id"),
  holdStatus: text("hold_status").notNull().default("missing"),
  holdExpiresAt: timestamp("hold_expires_at").notNull(),
  decidedAt: timestamp("decided_at"),
  decisionSource: text("decision_source"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBookingRequestSchema = createInsertSchema(bookingRequests).omit({
  id: true,
  status: true,
  holdEventId: true,
  holdStatus: true,
  holdExpiresAt: true,
  decidedAt: true,
  decisionSource: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBookingRequest = z.infer<typeof insertBookingRequestSchema>;
export type BookingRequest = typeof bookingRequests.$inferSelect;
export type NewBookingRequest = typeof bookingRequests.$inferInsert;

export const bookingActionTokens = pgTable("booking_action_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingRequestId: varchar("booking_request_id").notNull().references(() => bookingRequests.id),
  action: text("action").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBookingActionTokenSchema = createInsertSchema(bookingActionTokens).omit({
  id: true,
  usedAt: true,
  createdAt: true,
});

export type InsertBookingActionToken = z.infer<typeof insertBookingActionTokenSchema>;
export type BookingActionToken = typeof bookingActionTokens.$inferSelect;
export type NewBookingActionToken = typeof bookingActionTokens.$inferInsert;

export const googleCalendarConnection = pgTable("google_calendar_connection", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  googleEmail: text("google_email").notNull(),
  calendarId: text("calendar_id").notNull().default("primary"),
  refreshTokenEncrypted: text("refresh_token_encrypted").notNull(),
  accessTokenEncrypted: text("access_token_encrypted"),
  tokenExpiry: timestamp("token_expiry"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertGoogleCalendarConnectionSchema = createInsertSchema(googleCalendarConnection).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertGoogleCalendarConnection = z.infer<typeof insertGoogleCalendarConnectionSchema>;
export type GoogleCalendarConnection = typeof googleCalendarConnection.$inferSelect;
export type NewGoogleCalendarConnection = typeof googleCalendarConnection.$inferInsert;
