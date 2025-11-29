import { 
  type User, type InsertUser,
  type SiteContent, type InsertContent,
  type AdminSession, type InsertSession,
  users, siteContent, adminSessions
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, lt } from "drizzle-orm";

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
    } else {
      const [created] = await db
        .insert(siteContent)
        .values({ ...content, updatedAt: new Date() })
        .returning();
      return created;
    }
  }

  async createSession(session: InsertSession): Promise<AdminSession> {
    const [created] = await db.insert(adminSessions).values(session).returning();
    return created;
  }

  async getSessionByToken(token: string): Promise<AdminSession | undefined> {
    const now = new Date();
    const [session] = await db
      .select()
      .from(adminSessions)
      .where(eq(adminSessions.token, token));
    
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
}

export const storage = new DatabaseStorage();
