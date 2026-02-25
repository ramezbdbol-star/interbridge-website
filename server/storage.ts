import {
  type User,
  type InsertUser,
  type SiteContent,
  type InsertContent,
  type AdminSession,
  type InsertSession,
  type ContactRequest,
  type InsertContactRequest,
  type CustomerReview,
  type InsertReview,
  type DisputeCase,
  type InsertDisputeCase,
  type FurnitureConsultation,
  type InsertFurnitureConsultation,
  type BookingRequest,
  type NewBookingRequest,
  type BookingActionToken,
  type NewBookingActionToken,
  type GoogleCalendarConnection,
  type NewGoogleCalendarConnection,
  users,
  siteContent,
  adminSessions,
  contactRequests,
  customerReviews,
  disputeCases,
  furnitureConsultations,
  bookingRequests,
  bookingActionTokens,
  googleCalendarConnection,
} from "@shared/schema";
import { db } from "./db";
import { and, desc, eq, gt, isNull, lt, lte, or } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getContent(id: string): Promise<SiteContent | undefined>;
  getAllContent(): Promise<SiteContent[]>;
  upsertContent(content: InsertContent): Promise<SiteContent>;

  createSession(session: InsertSession): Promise<AdminSession>;
  getSessionByToken(token: string): Promise<AdminSession | undefined>;
  deleteSession(token: string): Promise<void>;
  cleanExpiredSessions(): Promise<void>;

  createContactRequest(request: InsertContactRequest): Promise<ContactRequest>;
  getAllContactRequests(): Promise<ContactRequest[]>;

  createReview(review: InsertReview): Promise<CustomerReview>;
  getAllReviews(): Promise<CustomerReview[]>;
  getApprovedReviews(): Promise<CustomerReview[]>;
  getPendingReviews(): Promise<CustomerReview[]>;
  updateReviewStatus(id: string, status: string): Promise<CustomerReview | undefined>;

  createDisputeCase(disputeCase: InsertDisputeCase): Promise<DisputeCase>;
  getAllDisputeCases(): Promise<DisputeCase[]>;

  createFurnitureConsultation(consultation: InsertFurnitureConsultation): Promise<FurnitureConsultation>;
  getAllFurnitureConsultations(): Promise<FurnitureConsultation[]>;

  createBookingRequest(request: NewBookingRequest): Promise<BookingRequest>;
  getBookingRequestById(id: string): Promise<BookingRequest | undefined>;
  getBookingRequests(status?: string): Promise<BookingRequest[]>;
  updateBookingRequest(id: string, updates: Partial<NewBookingRequest>): Promise<BookingRequest | undefined>;
  getPendingBookingsNeedingExpiry(now: Date): Promise<BookingRequest[]>;
  getPendingBookingsMissingHolds(now: Date): Promise<BookingRequest[]>;

  createBookingActionToken(token: NewBookingActionToken): Promise<BookingActionToken>;
  getBookingActionTokenByHash(tokenHash: string): Promise<BookingActionToken | undefined>;
  markBookingActionTokenUsed(id: string): Promise<void>;
  invalidateBookingActionTokens(bookingRequestId: string): Promise<void>;

  getGoogleCalendarConnection(): Promise<GoogleCalendarConnection | undefined>;
  upsertGoogleCalendarConnection(connection: NewGoogleCalendarConnection): Promise<GoogleCalendarConnection>;
  deleteGoogleCalendarConnection(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getContent(id: string): Promise<SiteContent | undefined> {
    const [content] = await db.select().from(siteContent).where(eq(siteContent.id, id));
    return content;
  }

  async getAllContent(): Promise<SiteContent[]> {
    return await db.select().from(siteContent);
  }

  async upsertContent(content: InsertContent): Promise<SiteContent> {
    const existing = await this.getContent(content.id);
    if (existing) {
      const [updated] = await db
        .update(siteContent)
        .set({ content: content.content, updatedAt: new Date() })
        .where(eq(siteContent.id, content.id))
        .returning();
      return updated;
    }

    const [created] = await db
      .insert(siteContent)
      .values({ ...content, updatedAt: new Date() })
      .returning();
    return created;
  }

  async createSession(session: InsertSession): Promise<AdminSession> {
    const [created] = await db.insert(adminSessions).values(session).returning();
    return created;
  }

  async getSessionByToken(token: string): Promise<AdminSession | undefined> {
    const now = new Date();
    const [session] = await db.select().from(adminSessions).where(eq(adminSessions.token, token));

    if (session && session.expiresAt > now) {
      return session;
    }
    return undefined;
  }

  async deleteSession(token: string): Promise<void> {
    await db.delete(adminSessions).where(eq(adminSessions.token, token));
  }

  async cleanExpiredSessions(): Promise<void> {
    const now = new Date();
    await db.delete(adminSessions).where(lt(adminSessions.expiresAt, now));
  }

  async createContactRequest(request: InsertContactRequest): Promise<ContactRequest> {
    const [created] = await db.insert(contactRequests).values(request).returning();
    return created;
  }

  async getAllContactRequests(): Promise<ContactRequest[]> {
    return await db.select().from(contactRequests).orderBy(desc(contactRequests.createdAt));
  }

  async createReview(review: InsertReview): Promise<CustomerReview> {
    const [created] = await db.insert(customerReviews).values(review).returning();
    return created;
  }

  async getAllReviews(): Promise<CustomerReview[]> {
    return await db.select().from(customerReviews).orderBy(desc(customerReviews.createdAt));
  }

  async getApprovedReviews(): Promise<CustomerReview[]> {
    return await db
      .select()
      .from(customerReviews)
      .where(eq(customerReviews.status, "approved"))
      .orderBy(desc(customerReviews.createdAt));
  }

  async getPendingReviews(): Promise<CustomerReview[]> {
    return await db
      .select()
      .from(customerReviews)
      .where(eq(customerReviews.status, "pending"))
      .orderBy(desc(customerReviews.createdAt));
  }

  async updateReviewStatus(id: string, status: string): Promise<CustomerReview | undefined> {
    const [updated] = await db
      .update(customerReviews)
      .set({ status, reviewedAt: new Date() })
      .where(eq(customerReviews.id, id))
      .returning();
    return updated;
  }

  async createDisputeCase(disputeCase: InsertDisputeCase): Promise<DisputeCase> {
    const [created] = await db.insert(disputeCases).values(disputeCase).returning();
    return created;
  }

  async getAllDisputeCases(): Promise<DisputeCase[]> {
    return await db.select().from(disputeCases).orderBy(desc(disputeCases.createdAt));
  }

  async createFurnitureConsultation(consultation: InsertFurnitureConsultation): Promise<FurnitureConsultation> {
    const [created] = await db.insert(furnitureConsultations).values(consultation).returning();
    return created;
  }

  async getAllFurnitureConsultations(): Promise<FurnitureConsultation[]> {
    return await db.select().from(furnitureConsultations).orderBy(desc(furnitureConsultations.createdAt));
  }

  async createBookingRequest(request: NewBookingRequest): Promise<BookingRequest> {
    const [created] = await db.insert(bookingRequests).values(request).returning();
    return created;
  }

  async getBookingRequestById(id: string): Promise<BookingRequest | undefined> {
    const [booking] = await db.select().from(bookingRequests).where(eq(bookingRequests.id, id));
    return booking;
  }

  async getBookingRequests(status?: string): Promise<BookingRequest[]> {
    if (!status) {
      return await db.select().from(bookingRequests).orderBy(desc(bookingRequests.createdAt));
    }

    return await db
      .select()
      .from(bookingRequests)
      .where(eq(bookingRequests.status, status))
      .orderBy(desc(bookingRequests.createdAt));
  }

  async updateBookingRequest(id: string, updates: Partial<NewBookingRequest>): Promise<BookingRequest | undefined> {
    const cleanedUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined),
    ) as Partial<NewBookingRequest>;

    const [updated] = await db
      .update(bookingRequests)
      .set({ ...cleanedUpdates, updatedAt: new Date() })
      .where(eq(bookingRequests.id, id))
      .returning();

    return updated;
  }

  async getPendingBookingsNeedingExpiry(now: Date): Promise<BookingRequest[]> {
    return await db
      .select()
      .from(bookingRequests)
      .where(and(eq(bookingRequests.status, "pending"), lte(bookingRequests.holdExpiresAt, now)))
      .orderBy(desc(bookingRequests.createdAt));
  }

  async getPendingBookingsMissingHolds(now: Date): Promise<BookingRequest[]> {
    return await db
      .select()
      .from(bookingRequests)
      .where(
        and(
          eq(bookingRequests.status, "pending"),
          or(eq(bookingRequests.holdStatus, "missing"), eq(bookingRequests.holdStatus, "error")),
          gt(bookingRequests.holdExpiresAt, now),
        ),
      )
      .orderBy(desc(bookingRequests.createdAt));
  }

  async createBookingActionToken(token: NewBookingActionToken): Promise<BookingActionToken> {
    const [created] = await db.insert(bookingActionTokens).values(token).returning();
    return created;
  }

  async getBookingActionTokenByHash(tokenHash: string): Promise<BookingActionToken | undefined> {
    const [token] = await db.select().from(bookingActionTokens).where(eq(bookingActionTokens.tokenHash, tokenHash));
    return token;
  }

  async markBookingActionTokenUsed(id: string): Promise<void> {
    await db.update(bookingActionTokens).set({ usedAt: new Date() }).where(eq(bookingActionTokens.id, id));
  }

  async invalidateBookingActionTokens(bookingRequestId: string): Promise<void> {
    await db
      .update(bookingActionTokens)
      .set({ usedAt: new Date() })
      .where(and(eq(bookingActionTokens.bookingRequestId, bookingRequestId), isNull(bookingActionTokens.usedAt)));
  }

  async getGoogleCalendarConnection(): Promise<GoogleCalendarConnection | undefined> {
    const [connection] = await db.select().from(googleCalendarConnection).orderBy(desc(googleCalendarConnection.createdAt)).limit(1);
    return connection;
  }

  async upsertGoogleCalendarConnection(connection: NewGoogleCalendarConnection): Promise<GoogleCalendarConnection> {
    const existing = await this.getGoogleCalendarConnection();

    if (existing) {
      const [updated] = await db
        .update(googleCalendarConnection)
        .set({
          googleEmail: connection.googleEmail,
          calendarId: connection.calendarId ?? "primary",
          refreshTokenEncrypted: connection.refreshTokenEncrypted,
          accessTokenEncrypted: connection.accessTokenEncrypted ?? null,
          tokenExpiry: connection.tokenExpiry ?? null,
          updatedAt: new Date(),
        })
        .where(eq(googleCalendarConnection.id, existing.id))
        .returning();
      return updated;
    }

    const [created] = await db
      .insert(googleCalendarConnection)
      .values({
        googleEmail: connection.googleEmail,
        calendarId: connection.calendarId ?? "primary",
        refreshTokenEncrypted: connection.refreshTokenEncrypted,
        accessTokenEncrypted: connection.accessTokenEncrypted ?? null,
        tokenExpiry: connection.tokenExpiry ?? null,
        updatedAt: new Date(),
      })
      .returning();

    return created;
  }

  async deleteGoogleCalendarConnection(): Promise<void> {
    const existing = await this.getGoogleCalendarConnection();
    if (!existing) return;

    await db.delete(googleCalendarConnection).where(eq(googleCalendarConnection.id, existing.id));
  }
}

export const storage = new DatabaseStorage();
