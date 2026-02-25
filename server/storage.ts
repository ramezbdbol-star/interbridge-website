import { randomUUID } from "crypto";
import { Firestore, Timestamp } from "@google-cloud/firestore";
import {
  type AdminSession,
  type BookingActionToken,
  type BookingRequest,
  type ContactRequest,
  type CustomerReview,
  type DisputeCase,
  type FurnitureConsultation,
  type GoogleCalendarConnection,
  type InsertContactRequest,
  type InsertContent,
  type InsertDisputeCase,
  type InsertFurnitureConsultation,
  type InsertReview,
  type InsertSession,
  type InsertUser,
  type NewBookingActionToken,
  type NewBookingRequest,
  type NewGoogleCalendarConnection,
  type SiteContent,
  type User,
} from "@shared/schema";

const firestore = new Firestore();

const collections = {
  users: "users",
  siteContent: "site_content",
  adminSessions: "admin_sessions",
  contactRequests: "contact_requests",
  customerReviews: "customer_reviews",
  disputeCases: "dispute_cases",
  furnitureConsultations: "furniture_consultations",
  bookingRequests: "booking_requests",
  bookingActionTokens: "booking_action_tokens",
  googleCalendarConnection: "google_calendar_connection",
} as const;

const googleConnectionDocId = "primary";

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

function sortByCreatedAtDesc<T extends { createdAt: Date }>(rows: T[]): T[] {
  return rows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

function parseUser(id: string, data: FirebaseFirestore.DocumentData): User {
  return {
    id,
    username: toStringValue(data.username),
    password: toStringValue(data.password),
  };
}

function parseSiteContent(id: string, data: FirebaseFirestore.DocumentData): SiteContent {
  return {
    id,
    content: toStringValue(data.content),
    updatedAt: toDate(data.updatedAt),
  };
}

function parseAdminSession(id: string, data: FirebaseFirestore.DocumentData): AdminSession {
  return {
    id,
    token: toStringValue(data.token),
    createdAt: toDate(data.createdAt),
    expiresAt: toDate(data.expiresAt),
  };
}

function parseContactRequest(id: string, data: FirebaseFirestore.DocumentData): ContactRequest {
  return {
    id,
    firstName: toStringValue(data.firstName),
    lastName: toStringValue(data.lastName),
    email: toStringValue(data.email),
    interestedIn: toStringValue(data.interestedIn),
    message: toStringValue(data.message),
    createdAt: toDate(data.createdAt),
  };
}

function parseCustomerReview(id: string, data: FirebaseFirestore.DocumentData): CustomerReview {
  return {
    id,
    customerName: toStringValue(data.customerName),
    companyName: toNullableString(data.companyName),
    country: toNullableString(data.country),
    serviceUsed: toStringValue(data.serviceUsed),
    rating: toStringValue(data.rating),
    reviewText: toStringValue(data.reviewText),
    status: toStringValue(data.status, "pending"),
    createdAt: toDate(data.createdAt),
    reviewedAt: toNullableDate(data.reviewedAt),
  };
}

function parseDisputeCase(id: string, data: FirebaseFirestore.DocumentData): DisputeCase {
  return {
    id,
    name: toStringValue(data.name),
    email: toStringValue(data.email),
    phone: toNullableString(data.phone),
    disputeType: toStringValue(data.disputeType),
    amountAtRisk: toStringValue(data.amountAtRisk),
    supplierInfo: toNullableString(data.supplierInfo),
    description: toStringValue(data.description),
    status: toStringValue(data.status, "pending"),
    createdAt: toDate(data.createdAt),
  };
}

function parseFurnitureConsultation(
  id: string,
  data: FirebaseFirestore.DocumentData,
): FurnitureConsultation {
  return {
    id,
    name: toStringValue(data.name),
    email: toStringValue(data.email),
    phone: toNullableString(data.phone),
    projectType: toStringValue(data.projectType),
    budgetRange: toStringValue(data.budgetRange),
    description: toStringValue(data.description),
    status: toStringValue(data.status, "pending"),
    createdAt: toDate(data.createdAt),
  };
}

function parseBookingRequest(id: string, data: FirebaseFirestore.DocumentData): BookingRequest {
  return {
    id,
    status: toStringValue(data.status, "pending"),
    name: toNullableString(data.name),
    email: toNullableString(data.email),
    phone: toNullableString(data.phone),
    purpose: toNullableString(data.purpose),
    notes: toNullableString(data.notes),
    needsMeetLink: toBooleanValue(data.needsMeetLink, false),
    isUrgent: toBooleanValue(data.isUrgent, false),
    visitorTimezone: toStringValue(data.visitorTimezone),
    startAtUtc: toDate(data.startAtUtc),
    endAtUtc: toDate(data.endAtUtc),
    holdEventId: toNullableString(data.holdEventId),
    holdStatus: toStringValue(data.holdStatus, "missing"),
    holdExpiresAt: toDate(data.holdExpiresAt),
    decidedAt: toNullableDate(data.decidedAt),
    decisionSource: toNullableString(data.decisionSource),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

function parseBookingActionToken(id: string, data: FirebaseFirestore.DocumentData): BookingActionToken {
  return {
    id,
    bookingRequestId: toStringValue(data.bookingRequestId),
    action: toStringValue(data.action),
    tokenHash: toStringValue(data.tokenHash),
    expiresAt: toDate(data.expiresAt),
    usedAt: toNullableDate(data.usedAt),
    createdAt: toDate(data.createdAt),
  };
}

function parseGoogleCalendarConnection(
  id: string,
  data: FirebaseFirestore.DocumentData,
): GoogleCalendarConnection {
  return {
    id,
    googleEmail: toStringValue(data.googleEmail),
    calendarId: toStringValue(data.calendarId, "primary"),
    refreshTokenEncrypted: toStringValue(data.refreshTokenEncrypted),
    accessTokenEncrypted: toNullableString(data.accessTokenEncrypted),
    tokenExpiry: toNullableDate(data.tokenExpiry),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

function normalizeBookingUpdates(updates: Partial<NewBookingRequest>): Record<string, unknown> {
  const normalized: Record<string, unknown> = {};

  Object.entries(updates).forEach(([key, value]) => {
    if (value === undefined) return;

    if (
      key === "startAtUtc" ||
      key === "endAtUtc" ||
      key === "holdExpiresAt" ||
      key === "decidedAt" ||
      key === "createdAt" ||
      key === "updatedAt" ||
      key === "tokenExpiry"
    ) {
      normalized[key] = value === null ? null : toDate(value);
      return;
    }

    normalized[key] = value;
  });

  return normalized;
}

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

export class FirestoreStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const doc = await firestore.collection(collections.users).doc(id).get();
    if (!doc.exists) return undefined;
    return parseUser(doc.id, doc.data() || {});
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const snapshot = await firestore.collection(collections.users).where("username", "==", username).limit(1).get();
    const doc = snapshot.docs[0];
    if (!doc) return undefined;
    return parseUser(doc.id, doc.data());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      username: insertUser.username,
      password: insertUser.password,
    };

    await firestore.collection(collections.users).doc(id).set(user);
    return user;
  }

  async getContent(id: string): Promise<SiteContent | undefined> {
    const doc = await firestore.collection(collections.siteContent).doc(id).get();
    if (!doc.exists) return undefined;
    return parseSiteContent(doc.id, doc.data() || {});
  }

  async getAllContent(): Promise<SiteContent[]> {
    const snapshot = await firestore.collection(collections.siteContent).get();
    return snapshot.docs.map((doc) => parseSiteContent(doc.id, doc.data()));
  }

  async upsertContent(content: InsertContent): Promise<SiteContent> {
    const updatedAt = new Date();
    await firestore.collection(collections.siteContent).doc(content.id).set(
      {
        content: content.content,
        updatedAt,
      },
      { merge: true },
    );

    return {
      id: content.id,
      content: content.content,
      updatedAt,
    };
  }

  async createSession(session: InsertSession): Promise<AdminSession> {
    const id = randomUUID();
    const created: AdminSession = {
      id,
      token: session.token,
      createdAt: new Date(),
      expiresAt: toDate(session.expiresAt),
    };

    await firestore.collection(collections.adminSessions).doc(id).set(created);
    return created;
  }

  async getSessionByToken(token: string): Promise<AdminSession | undefined> {
    const snapshot = await firestore
      .collection(collections.adminSessions)
      .where("token", "==", token)
      .limit(1)
      .get();

    const doc = snapshot.docs[0];
    if (!doc) return undefined;

    const session = parseAdminSession(doc.id, doc.data());
    if (session.expiresAt <= new Date()) {
      return undefined;
    }

    return session;
  }

  async deleteSession(token: string): Promise<void> {
    const snapshot = await firestore.collection(collections.adminSessions).where("token", "==", token).get();
    if (snapshot.empty) return;

    const batch = firestore.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }

  async cleanExpiredSessions(): Promise<void> {
    const snapshot = await firestore
      .collection(collections.adminSessions)
      .where("expiresAt", "<", new Date())
      .get();

    if (snapshot.empty) return;

    const batch = firestore.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }

  async createContactRequest(request: InsertContactRequest): Promise<ContactRequest> {
    const id = randomUUID();
    const created: ContactRequest = {
      id,
      firstName: request.firstName,
      lastName: request.lastName,
      email: request.email,
      interestedIn: request.interestedIn,
      message: request.message,
      createdAt: new Date(),
    };

    await firestore.collection(collections.contactRequests).doc(id).set(created);
    return created;
  }

  async getAllContactRequests(): Promise<ContactRequest[]> {
    const snapshot = await firestore.collection(collections.contactRequests).get();
    const items = snapshot.docs.map((doc) => parseContactRequest(doc.id, doc.data()));
    return sortByCreatedAtDesc(items);
  }

  async createReview(review: InsertReview): Promise<CustomerReview> {
    const id = randomUUID();
    const created: CustomerReview = {
      id,
      customerName: review.customerName,
      companyName: review.companyName ?? null,
      country: review.country ?? null,
      serviceUsed: review.serviceUsed,
      rating: review.rating,
      reviewText: review.reviewText,
      status: "pending",
      createdAt: new Date(),
      reviewedAt: null,
    };

    await firestore.collection(collections.customerReviews).doc(id).set(created);
    return created;
  }

  async getAllReviews(): Promise<CustomerReview[]> {
    const snapshot = await firestore.collection(collections.customerReviews).get();
    const items = snapshot.docs.map((doc) => parseCustomerReview(doc.id, doc.data()));
    return sortByCreatedAtDesc(items);
  }

  async getApprovedReviews(): Promise<CustomerReview[]> {
    const snapshot = await firestore.collection(collections.customerReviews).where("status", "==", "approved").get();
    const items = snapshot.docs.map((doc) => parseCustomerReview(doc.id, doc.data()));
    return sortByCreatedAtDesc(items);
  }

  async getPendingReviews(): Promise<CustomerReview[]> {
    const snapshot = await firestore.collection(collections.customerReviews).where("status", "==", "pending").get();
    const items = snapshot.docs.map((doc) => parseCustomerReview(doc.id, doc.data()));
    return sortByCreatedAtDesc(items);
  }

  async updateReviewStatus(id: string, status: string): Promise<CustomerReview | undefined> {
    const ref = firestore.collection(collections.customerReviews).doc(id);
    const existing = await ref.get();
    if (!existing.exists) return undefined;

    await ref.set(
      {
        status,
        reviewedAt: new Date(),
      },
      { merge: true },
    );

    const updated = await ref.get();
    return parseCustomerReview(updated.id, updated.data() || {});
  }

  async createDisputeCase(disputeCase: InsertDisputeCase): Promise<DisputeCase> {
    const id = randomUUID();
    const created: DisputeCase = {
      id,
      name: disputeCase.name,
      email: disputeCase.email,
      phone: disputeCase.phone ?? null,
      disputeType: disputeCase.disputeType,
      amountAtRisk: disputeCase.amountAtRisk,
      supplierInfo: disputeCase.supplierInfo ?? null,
      description: disputeCase.description,
      status: "pending",
      createdAt: new Date(),
    };

    await firestore.collection(collections.disputeCases).doc(id).set(created);
    return created;
  }

  async getAllDisputeCases(): Promise<DisputeCase[]> {
    const snapshot = await firestore.collection(collections.disputeCases).get();
    const items = snapshot.docs.map((doc) => parseDisputeCase(doc.id, doc.data()));
    return sortByCreatedAtDesc(items);
  }

  async createFurnitureConsultation(
    consultation: InsertFurnitureConsultation,
  ): Promise<FurnitureConsultation> {
    const id = randomUUID();
    const created: FurnitureConsultation = {
      id,
      name: consultation.name,
      email: consultation.email,
      phone: consultation.phone ?? null,
      projectType: consultation.projectType,
      budgetRange: consultation.budgetRange,
      description: consultation.description,
      status: "pending",
      createdAt: new Date(),
    };

    await firestore.collection(collections.furnitureConsultations).doc(id).set(created);
    return created;
  }

  async getAllFurnitureConsultations(): Promise<FurnitureConsultation[]> {
    const snapshot = await firestore.collection(collections.furnitureConsultations).get();
    const items = snapshot.docs.map((doc) => parseFurnitureConsultation(doc.id, doc.data()));
    return sortByCreatedAtDesc(items);
  }

  async createBookingRequest(request: NewBookingRequest): Promise<BookingRequest> {
    const now = new Date();
    const id = request.id ?? randomUUID();
    const created: BookingRequest = {
      id,
      status: request.status ?? "pending",
      name: request.name ?? null,
      email: request.email ?? null,
      phone: request.phone ?? null,
      purpose: request.purpose ?? null,
      notes: request.notes ?? null,
      needsMeetLink: request.needsMeetLink ?? false,
      isUrgent: request.isUrgent ?? false,
      visitorTimezone: request.visitorTimezone ?? "UTC",
      startAtUtc: toDate(request.startAtUtc),
      endAtUtc: toDate(request.endAtUtc),
      holdEventId: request.holdEventId ?? null,
      holdStatus: request.holdStatus ?? "missing",
      holdExpiresAt: toDate(request.holdExpiresAt),
      decidedAt: request.decidedAt ? toDate(request.decidedAt) : null,
      decisionSource: request.decisionSource ?? null,
      createdAt: request.createdAt ? toDate(request.createdAt) : now,
      updatedAt: request.updatedAt ? toDate(request.updatedAt) : now,
    };

    await firestore.collection(collections.bookingRequests).doc(id).set(created);
    return created;
  }

  async getBookingRequestById(id: string): Promise<BookingRequest | undefined> {
    const doc = await firestore.collection(collections.bookingRequests).doc(id).get();
    if (!doc.exists) return undefined;
    return parseBookingRequest(doc.id, doc.data() || {});
  }

  async getBookingRequests(status?: string): Promise<BookingRequest[]> {
    const snapshot = status
      ? await firestore.collection(collections.bookingRequests).where("status", "==", status).get()
      : await firestore.collection(collections.bookingRequests).get();

    const items = snapshot.docs.map((doc) => parseBookingRequest(doc.id, doc.data()));
    return sortByCreatedAtDesc(items);
  }

  async updateBookingRequest(id: string, updates: Partial<NewBookingRequest>): Promise<BookingRequest | undefined> {
    const ref = firestore.collection(collections.bookingRequests).doc(id);
    const existing = await ref.get();
    if (!existing.exists) return undefined;

    const normalized = normalizeBookingUpdates(updates);
    normalized.updatedAt = new Date();

    await ref.set(normalized, { merge: true });
    const updated = await ref.get();
    return parseBookingRequest(updated.id, updated.data() || {});
  }

  async getPendingBookingsNeedingExpiry(now: Date): Promise<BookingRequest[]> {
    const snapshot = await firestore.collection(collections.bookingRequests).where("status", "==", "pending").get();
    const items = snapshot.docs
      .map((doc) => parseBookingRequest(doc.id, doc.data()))
      .filter((booking) => booking.holdExpiresAt <= now);

    return sortByCreatedAtDesc(items);
  }

  async getPendingBookingsMissingHolds(now: Date): Promise<BookingRequest[]> {
    const snapshot = await firestore.collection(collections.bookingRequests).where("status", "==", "pending").get();
    const items = snapshot.docs
      .map((doc) => parseBookingRequest(doc.id, doc.data()))
      .filter(
        (booking) =>
          (booking.holdStatus === "missing" || booking.holdStatus === "error") && booking.holdExpiresAt > now,
      );

    return sortByCreatedAtDesc(items);
  }

  async createBookingActionToken(token: NewBookingActionToken): Promise<BookingActionToken> {
    const duplicate = await firestore
      .collection(collections.bookingActionTokens)
      .where("tokenHash", "==", token.tokenHash)
      .limit(1)
      .get();

    if (!duplicate.empty) {
      throw new Error("Booking action token hash already exists");
    }

    const id = token.id ?? randomUUID();
    const created: BookingActionToken = {
      id,
      bookingRequestId: token.bookingRequestId,
      action: token.action,
      tokenHash: token.tokenHash,
      expiresAt: toDate(token.expiresAt),
      usedAt: token.usedAt ? toDate(token.usedAt) : null,
      createdAt: token.createdAt ? toDate(token.createdAt) : new Date(),
    };

    await firestore.collection(collections.bookingActionTokens).doc(id).set(created);
    return created;
  }

  async getBookingActionTokenByHash(tokenHash: string): Promise<BookingActionToken | undefined> {
    const snapshot = await firestore
      .collection(collections.bookingActionTokens)
      .where("tokenHash", "==", tokenHash)
      .limit(1)
      .get();

    const doc = snapshot.docs[0];
    if (!doc) return undefined;
    return parseBookingActionToken(doc.id, doc.data());
  }

  async markBookingActionTokenUsed(id: string): Promise<void> {
    await firestore.collection(collections.bookingActionTokens).doc(id).set(
      {
        usedAt: new Date(),
      },
      { merge: true },
    );
  }

  async invalidateBookingActionTokens(bookingRequestId: string): Promise<void> {
    const snapshot = await firestore
      .collection(collections.bookingActionTokens)
      .where("bookingRequestId", "==", bookingRequestId)
      .where("usedAt", "==", null)
      .get();

    if (snapshot.empty) return;

    const batch = firestore.batch();
    snapshot.docs.forEach((doc) =>
      batch.set(
        doc.ref,
        {
          usedAt: new Date(),
        },
        { merge: true },
      ),
    );
    await batch.commit();
  }

  async getGoogleCalendarConnection(): Promise<GoogleCalendarConnection | undefined> {
    const doc = await firestore.collection(collections.googleCalendarConnection).doc(googleConnectionDocId).get();
    if (!doc.exists) return undefined;
    return parseGoogleCalendarConnection(doc.id, doc.data() || {});
  }

  async upsertGoogleCalendarConnection(
    connection: NewGoogleCalendarConnection,
  ): Promise<GoogleCalendarConnection> {
    const ref = firestore.collection(collections.googleCalendarConnection).doc(googleConnectionDocId);
    const existing = await ref.get();
    const now = new Date();

    const payload = {
      googleEmail: connection.googleEmail,
      calendarId: connection.calendarId ?? "primary",
      refreshTokenEncrypted: connection.refreshTokenEncrypted,
      accessTokenEncrypted: connection.accessTokenEncrypted ?? null,
      tokenExpiry: connection.tokenExpiry ? toDate(connection.tokenExpiry) : null,
      updatedAt: now,
      createdAt: existing.exists ? toDate((existing.data() || {}).createdAt) : now,
    };

    await ref.set(payload, { merge: true });
    const saved = await ref.get();
    return parseGoogleCalendarConnection(saved.id, saved.data() || {});
  }

  async deleteGoogleCalendarConnection(): Promise<void> {
    await firestore.collection(collections.googleCalendarConnection).doc(googleConnectionDocId).delete();
  }
}

export const storage = new FirestoreStorage();
