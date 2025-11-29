import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { randomBytes } from "crypto";

const ADMIN_USERNAME = "Mirabelle";
const ADMIN_PASSWORD = "Mira.112233";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/admin/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        const token = randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        
        await storage.createSession({ token, expiresAt });
        
        res.json({ success: true, token });
      } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  app.post("/api/admin/logout", async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        await storage.deleteSession(token);
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  app.get("/api/admin/verify", async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.json({ valid: false });
      }
      
      const token = authHeader.substring(7);
      const session = await storage.getSessionByToken(token);
      
      res.json({ valid: !!session });
    } catch (error) {
      console.error("Verify error:", error);
      res.status(500).json({ valid: false });
    }
  });

  app.get("/api/content", async (_req: Request, res: Response) => {
    try {
      const allContent = await storage.getAllContent();
      const contentMap: Record<string, string> = {};
      for (const item of allContent) {
        contentMap[item.id] = item.content;
      }
      res.json(contentMap);
    } catch (error) {
      console.error("Get content error:", error);
      res.status(500).json({ error: "Failed to fetch content" });
    }
  });

  app.post("/api/content", async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const token = authHeader.substring(7);
      const session = await storage.getSessionByToken(token);
      
      if (!session) {
        return res.status(401).json({ error: "Session expired or invalid" });
      }
      
      const { id, content } = req.body;
      
      if (!id || content === undefined) {
        return res.status(400).json({ error: "Missing id or content" });
      }
      
      const updated = await storage.upsertContent({ id, content });
      res.json({ success: true, content: updated });
    } catch (error) {
      console.error("Update content error:", error);
      res.status(500).json({ error: "Failed to update content" });
    }
  });

  app.post("/api/content/batch", async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const token = authHeader.substring(7);
      const session = await storage.getSessionByToken(token);
      
      if (!session) {
        return res.status(401).json({ error: "Session expired or invalid" });
      }
      
      const { items } = req.body;
      
      if (!items || !Array.isArray(items)) {
        return res.status(400).json({ error: "Missing items array" });
      }
      
      const results = [];
      for (const item of items) {
        if (item.id && item.content !== undefined) {
          const updated = await storage.upsertContent({ id: item.id, content: item.content });
          results.push(updated);
        }
      }
      
      res.json({ success: true, updated: results.length });
    } catch (error) {
      console.error("Batch update error:", error);
      res.status(500).json({ error: "Failed to update content" });
    }
  });

  return httpServer;
}
