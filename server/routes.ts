import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { randomBytes } from "crypto";
import { insertContactRequestSchema, insertReviewSchema } from "@shared/schema";
import { sendContactNotification } from "./email";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "Mirabelle";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Mira.112233";

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

  app.post("/api/contact", async (req: Request, res: Response) => {
    try {
      const parseResult = insertContactRequestSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid form data", 
          details: parseResult.error.errors 
        });
      }
      
      const contactRequest = await storage.createContactRequest(parseResult.data);
      
      const emailSent = await sendContactNotification(parseResult.data);
      
      res.json({ 
        success: true, 
        message: "Your inquiry has been submitted successfully! We will get back to you soon.",
        emailSent 
      });
    } catch (error) {
      console.error("Contact form error:", error);
      res.status(500).json({ error: "Failed to submit inquiry. Please try again." });
    }
  });

  // Public endpoint to submit a review (no auth required)
  app.post("/api/reviews", async (req: Request, res: Response) => {
    try {
      const parseResult = insertReviewSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid review data", 
          details: parseResult.error.errors 
        });
      }
      
      const review = await storage.createReview(parseResult.data);
      
      res.json({ 
        success: true, 
        message: "Thank you for your review! It will be published after approval.",
        review 
      });
    } catch (error) {
      console.error("Review submission error:", error);
      res.status(500).json({ error: "Failed to submit review. Please try again." });
    }
  });

  // Public endpoint to get approved reviews
  app.get("/api/reviews/approved", async (_req: Request, res: Response) => {
    try {
      const reviews = await storage.getApprovedReviews();
      res.json(reviews);
    } catch (error) {
      console.error("Get approved reviews error:", error);
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  // Admin endpoint to get all reviews (requires auth)
  app.get("/api/admin/reviews", async (req: Request, res: Response) => {
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
      
      const reviews = await storage.getAllReviews();
      res.json(reviews);
    } catch (error) {
      console.error("Get all reviews error:", error);
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  // Admin endpoint to get pending reviews
  app.get("/api/admin/reviews/pending", async (req: Request, res: Response) => {
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
      
      const reviews = await storage.getPendingReviews();
      res.json(reviews);
    } catch (error) {
      console.error("Get pending reviews error:", error);
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  // Admin endpoint to update review status (approve/reject)
  app.patch("/api/admin/reviews/:id", async (req: Request, res: Response) => {
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
      
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status || !["approved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status. Must be 'approved' or 'rejected'" });
      }
      
      const updated = await storage.updateReviewStatus(id, status);
      
      if (!updated) {
        return res.status(404).json({ error: "Review not found" });
      }
      
      res.json({ success: true, review: updated });
    } catch (error) {
      console.error("Update review status error:", error);
      res.status(500).json({ error: "Failed to update review" });
    }
  });

  // Public endpoint to submit a dispute case
  app.post("/api/dispute-cases", async (req: Request, res: Response) => {
    try {
      const { insertDisputeCaseSchema } = await import("@shared/schema");
      const parseResult = insertDisputeCaseSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid case data", 
          details: parseResult.error.errors 
        });
      }
      
      const disputeCase = await storage.createDisputeCase(parseResult.data);
      
      res.json({ 
        success: true, 
        message: "Your case has been submitted. We will review it and contact you within 24-48 hours.",
        disputeCase 
      });
    } catch (error) {
      console.error("Dispute case submission error:", error);
      res.status(500).json({ error: "Failed to submit case. Please try again." });
    }
  });

  // Public endpoint to submit a furniture consultation request
  app.post("/api/furniture-consultation", async (req: Request, res: Response) => {
    try {
      const { insertFurnitureConsultationSchema } = await import("@shared/schema");
      const parseResult = insertFurnitureConsultationSchema.safeParse(req.body);

      if (!parseResult.success) {
        return res.status(400).json({
          error: "Invalid consultation data",
          details: parseResult.error.errors
        });
      }

      const consultation = await storage.createFurnitureConsultation(parseResult.data);

      res.json({
        success: true,
        message: "Your consultation request has been submitted. Our design team will contact you within 24-48 hours.",
        consultation
      });
    } catch (error) {
      console.error("Furniture consultation submission error:", error);
      res.status(500).json({ error: "Failed to submit consultation request. Please try again." });
    }
  });

  // Admin endpoint to get all dispute cases
  app.get("/api/admin/dispute-cases", async (req: Request, res: Response) => {
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
      
      const cases = await storage.getAllDisputeCases();
      res.json(cases);
    } catch (error) {
      console.error("Get dispute cases error:", error);
      res.status(500).json({ error: "Failed to fetch cases" });
    }
  });

  return httpServer;
}
