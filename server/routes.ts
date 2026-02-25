import type { Express, Request, Response } from "express";
import { type Server } from "http";
import { randomBytes } from "crypto";
import { storage } from "./storage";
import { insertContactRequestSchema, insertReviewSchema } from "@shared/schema";
import {
  BookingValidationError,
  applyBookingDecision,
  createPendingBooking,
  processBookingMaintenance,
  validateBookingPayload,
} from "./bookingService";
import {
  buildGoogleConnectUrl,
  encryptToken,
  exchangeCodeForTokens,
  getGoogleUserEmail,
  hasGoogleOauthConfig,
} from "./googleCalendar";
import {
  sendBookingAdminNotification,
  sendBookingApprovalConfirmation,
  sendContactNotification,
} from "./email";
import { hashToken, verifySignedActionToken } from "./secureTokens";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "Mirabelle";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Mira.112233";

const BOOKING_RATE_LIMIT_PER_HOUR = Number(process.env.BOOKING_RATE_LIMIT_PER_HOUR || "6");
const BOOKING_RATE_WINDOW_MS = 60 * 60 * 1000;
const GOOGLE_OAUTH_STATE_TTL_MS = 10 * 60 * 1000;
const BOOKING_MAINTENANCE_INTERVAL_MS = 5 * 60 * 1000;

const bookingRateMap = new Map<string, number[]>();
const googleOauthStateStore = new Map<string, number>();
let bookingMaintenanceStarted = false;

async function requireAdminSession(req: Request, res: Response): Promise<boolean> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }

  const token = authHeader.substring(7);
  const session = await storage.getSessionByToken(token);

  if (!session) {
    res.status(401).json({ error: "Session expired or invalid" });
    return false;
  }

  return true;
}

function getRequestIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }

  return req.ip || "unknown";
}

function checkBookingRateLimit(ip: string): boolean {
  const now = Date.now();
  const current = bookingRateMap.get(ip) || [];
  const filtered = current.filter((timestamp) => now - timestamp < BOOKING_RATE_WINDOW_MS);

  if (filtered.length >= BOOKING_RATE_LIMIT_PER_HOUR) {
    bookingRateMap.set(ip, filtered);
    return false;
  }

  filtered.push(now);
  bookingRateMap.set(ip, filtered);
  return true;
}

function getBaseUrl(req: Request): string {
  if (process.env.PUBLIC_BASE_URL) {
    return process.env.PUBLIC_BASE_URL.replace(/\/$/, "");
  }

  const forwardedProto = req.headers["x-forwarded-proto"];
  const proto = typeof forwardedProto === "string" ? forwardedProto.split(",")[0] : req.protocol;
  const host = req.get("host");
  return `${proto}://${host}`;
}

function renderActionHtml(title: string, message: string, success: boolean): string {
  const color = success ? "#14532d" : "#7f1d1d";
  const bg = success ? "#dcfce7" : "#fee2e2";

  return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>
      body { font-family: Arial, sans-serif; background: #f8fafc; margin: 0; padding: 32px; }
      .card { max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
      .head { padding: 18px 20px; color: white; background: ${color}; }
      .body { padding: 20px; background: ${bg}; color: #111827; }
      .footer { padding: 16px 20px; background: white; border-top: 1px solid #e2e8f0; }
      a { color: #2563eb; text-decoration: none; font-weight: 600; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="head"><h2 style="margin:0;">${title}</h2></div>
      <div class="body"><p style="margin:0; line-height:1.5;">${message}</p></div>
      <div class="footer"><a href="/admin">Open Admin Panel</a></div>
    </div>
  </body>
</html>
  `;
}

function cleanupGoogleOauthStates() {
  const now = Date.now();
  googleOauthStateStore.forEach((expiresAt, state) => {
    if (expiresAt <= now) {
      googleOauthStateStore.delete(state);
    }
  });
}

function getGoogleOauthState(): string {
  cleanupGoogleOauthStates();
  const state = randomBytes(20).toString("hex");
  googleOauthStateStore.set(state, Date.now() + GOOGLE_OAUTH_STATE_TTL_MS);
  return state;
}

function consumeGoogleOauthState(state: string): boolean {
  cleanupGoogleOauthStates();
  const expiresAt = googleOauthStateStore.get(state);
  if (!expiresAt || expiresAt <= Date.now()) {
    googleOauthStateStore.delete(state);
    return false;
  }

  googleOauthStateStore.delete(state);
  return true;
}

async function sendBookingApprovedEmail(bookingId: string): Promise<void> {
  const booking = await storage.getBookingRequestById(bookingId);
  if (!booking || !booking.email || booking.status !== "approved") {
    return;
  }

  await sendBookingApprovalConfirmation({
    email: booking.email,
    name: booking.name,
    startAtUtc: booking.startAtUtc,
    endAtUtc: booking.endAtUtc,
    visitorTimezone: booking.visitorTimezone,
    isUrgent: booking.isUrgent,
    needsMeetLink: booking.needsMeetLink,
  });
}

function startBookingMaintenanceLoop() {
  if (bookingMaintenanceStarted) return;
  bookingMaintenanceStarted = true;

  const run = async () => {
    try {
      await processBookingMaintenance();
    } catch (error) {
      console.error("Booking maintenance error:", error);
    }
  };

  setInterval(run, BOOKING_MAINTENANCE_INTERVAL_MS);
  void run();
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
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
      if (!(await requireAdminSession(req, res))) return;

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
      if (!(await requireAdminSession(req, res))) return;

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
          details: parseResult.error.errors,
        });
      }

      await storage.createContactRequest(parseResult.data);
      const emailSent = await sendContactNotification(parseResult.data);

      res.json({
        success: true,
        message: "Your inquiry has been submitted successfully! We will get back to you soon.",
        emailSent,
      });
    } catch (error) {
      console.error("Contact form error:", error);
      res.status(500).json({ error: "Failed to submit inquiry. Please try again." });
    }
  });

  app.post("/api/bookings/validate", async (req: Request, res: Response) => {
    try {
      const validation = await validateBookingPayload(req.body || {});
      res.json(validation);
    } catch (error) {
      console.error("Booking validation error:", error);
      res.status(500).json({
        valid: false,
        errors: ["Failed to validate booking. Please try again."],
        warnings: [],
        hasConflict: false,
        isOutsideWorkingWindow: false,
        requiresUrgent: false,
        googleConnected: false,
        googleReachable: false,
      });
    }
  });

  app.post("/api/bookings", async (req: Request, res: Response) => {
    try {
      const honeypot = typeof req.body?.companyWebsite === "string" ? req.body.companyWebsite.trim() : "";
      if (honeypot) {
        return res.json({
          success: true,
          status: "pending",
          message: "Booking request received. We will review it shortly.",
        });
      }

      const ip = getRequestIp(req);
      if (!checkBookingRateLimit(ip)) {
        return res.status(429).json({
          success: false,
          error: "Too many booking attempts. Please wait and try again.",
        });
      }

      const result = await createPendingBooking(req.body || {});
      const baseUrl = getBaseUrl(req);
      const approveUrl = `${baseUrl}/api/bookings/action?token=${encodeURIComponent(result.approveToken)}`;
      const rejectUrl = `${baseUrl}/api/bookings/action?token=${encodeURIComponent(result.rejectToken)}`;

      await sendBookingAdminNotification({
        bookingId: result.booking.id,
        name: result.booking.name,
        email: result.booking.email,
        phone: result.booking.phone,
        purpose: result.booking.purpose,
        notes: result.booking.notes,
        isUrgent: result.booking.isUrgent,
        needsMeetLink: result.booking.needsMeetLink,
        visitorTimezone: result.booking.visitorTimezone,
        startAtUtc: result.booking.startAtUtc,
        endAtUtc: result.booking.endAtUtc,
        holdExpiresAt: result.booking.holdExpiresAt,
        approveUrl,
        rejectUrl,
      });

      res.json({
        success: true,
        status: "pending",
        message: "Booking request submitted. It will be confirmed only after admin approval.",
        bookingId: result.booking.id,
        holdExpiresAt: result.booking.holdExpiresAt,
        warnings: result.warnings,
      });
    } catch (error) {
      if (error instanceof BookingValidationError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.errors,
        });
      }

      console.error("Create booking error:", error);
      res.status(500).json({ success: false, error: "Failed to create booking request." });
    }
  });

  app.get("/api/bookings/action", async (req: Request, res: Response) => {
    try {
      const token = typeof req.query.token === "string" ? req.query.token : "";
      if (!token) {
        return res
          .status(400)
          .send(renderActionHtml("Invalid Action", "Missing booking action token.", false));
      }

      const signedPayload = verifySignedActionToken(token);
      if (!signedPayload) {
        return res
          .status(400)
          .send(renderActionHtml("Invalid Action", "This action link is invalid or tampered.", false));
      }

      const tokenHash = hashToken(token);
      const tokenRecord = await storage.getBookingActionTokenByHash(tokenHash);

      if (!tokenRecord) {
        return res
          .status(400)
          .send(renderActionHtml("Invalid Action", "This action link was not found.", false));
      }

      const payloadExpiry = new Date(signedPayload.expiresAt);
      if (Number.isNaN(payloadExpiry.getTime()) || payloadExpiry <= new Date()) {
        return res
          .status(400)
          .send(renderActionHtml("Action Expired", "This action link has expired.", false));
      }

      if (tokenRecord.usedAt) {
        return res
          .status(400)
          .send(renderActionHtml("Action Already Used", "This action link has already been used.", false));
      }

      if (tokenRecord.expiresAt <= new Date()) {
        return res
          .status(400)
          .send(renderActionHtml("Action Expired", "This action link has expired.", false));
      }

      if (
        tokenRecord.action !== signedPayload.action ||
        tokenRecord.bookingRequestId !== signedPayload.bookingRequestId ||
        tokenRecord.expiresAt.getTime() !== payloadExpiry.getTime()
      ) {
        return res
          .status(400)
          .send(renderActionHtml("Invalid Action", "Action token payload mismatch.", false));
      }

      const updated = await applyBookingDecision({
        bookingRequestId: tokenRecord.bookingRequestId,
        action: tokenRecord.action as "approve" | "reject",
        source: "email_link",
      });

      if (updated.status === "approved") {
        await sendBookingApprovedEmail(updated.id);
      }

      const title = updated.status === "approved" ? "Booking Approved" : "Booking Rejected";
      const message =
        updated.status === "approved"
          ? "The booking has been approved and the client calendar invite was sent."
          : "The booking has been rejected and the temporary hold was released.";

      res.send(renderActionHtml(title, message, true));
    } catch (error: any) {
      const message = error?.message || "Failed to process booking action.";
      console.error("Booking action error:", error);
      res.status(400).send(renderActionHtml("Action Failed", message, false));
    }
  });

  app.get("/api/admin/bookings", async (req: Request, res: Response) => {
    try {
      if (!(await requireAdminSession(req, res))) return;

      const statusParam = typeof req.query.status === "string" ? req.query.status : "pending";
      const bookings = await storage.getBookingRequests(statusParam === "all" ? undefined : statusParam);
      res.json(bookings);
    } catch (error) {
      console.error("Get admin bookings error:", error);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  app.patch("/api/admin/bookings/:id", async (req: Request, res: Response) => {
    try {
      if (!(await requireAdminSession(req, res))) return;

      const { id } = req.params;
      const { action, email } = req.body || {};

      if (!action || !["approve", "reject"].includes(action)) {
        return res.status(400).json({ error: "Action must be 'approve' or 'reject'." });
      }

      const updated = await applyBookingDecision({
        bookingRequestId: id,
        action,
        source: "admin_panel",
        emailOverride: typeof email === "string" ? email : null,
      });

      if (updated.status === "approved") {
        await sendBookingApprovedEmail(updated.id);
      }

      res.json({ success: true, booking: updated });
    } catch (error: any) {
      console.error("Admin booking decision error:", error);
      res.status(400).json({ error: error?.message || "Failed to update booking." });
    }
  });

  app.get("/api/admin/google-calendar/status", async (req: Request, res: Response) => {
    try {
      if (!(await requireAdminSession(req, res))) return;

      const connection = await storage.getGoogleCalendarConnection();
      res.json({
        connected: !!connection,
        hasOauthConfig: hasGoogleOauthConfig(),
        googleEmail: connection?.googleEmail || null,
        calendarId: connection?.calendarId || "primary",
        tokenExpiry: connection?.tokenExpiry || null,
      });
    } catch (error) {
      console.error("Google status error:", error);
      res.status(500).json({ error: "Failed to get Google Calendar status." });
    }
  });

  app.post("/api/admin/google-calendar/connect-url", async (req: Request, res: Response) => {
    try {
      if (!(await requireAdminSession(req, res))) return;

      if (!hasGoogleOauthConfig()) {
        return res.status(400).json({
          error:
            "Google OAuth is not configured. Please set GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_REDIRECT_URI, and GOOGLE_TOKEN_ENCRYPTION_KEY.",
        });
      }

      const state = getGoogleOauthState();
      const url = buildGoogleConnectUrl(state);

      res.json({ url });
    } catch (error: any) {
      console.error("Google connect-url error:", error);
      res.status(500).json({ error: error?.message || "Failed to build connect URL." });
    }
  });

  app.get("/api/admin/google-calendar/callback", async (req: Request, res: Response) => {
    try {
      const code = typeof req.query.code === "string" ? req.query.code : "";
      const state = typeof req.query.state === "string" ? req.query.state : "";
      const oauthError = typeof req.query.error === "string" ? req.query.error : "";

      if (oauthError) {
        return res
          .status(400)
          .send(renderActionHtml("Google Connect Failed", `Google returned error: ${oauthError}`, false));
      }

      if (!state || !consumeGoogleOauthState(state)) {
        return res
          .status(400)
          .send(renderActionHtml("Google Connect Failed", "Invalid or expired OAuth state.", false));
      }

      if (!code) {
        return res
          .status(400)
          .send(renderActionHtml("Google Connect Failed", "Missing OAuth code.", false));
      }

      const tokens = await exchangeCodeForTokens(code);
      const googleEmail = await getGoogleUserEmail(tokens.accessToken);

      await storage.upsertGoogleCalendarConnection({
        googleEmail,
        calendarId: "primary",
        refreshTokenEncrypted: encryptToken(tokens.refreshToken),
        accessTokenEncrypted: encryptToken(tokens.accessToken),
        tokenExpiry: tokens.tokenExpiry,
      });

      res.send(
        renderActionHtml(
          "Google Calendar Connected",
          "Google Calendar was connected successfully. You can close this tab and return to the admin panel.",
          true,
        ),
      );
    } catch (error: any) {
      console.error("Google callback error:", error);
      res
        .status(500)
        .send(renderActionHtml("Google Connect Failed", error?.message || "Unknown callback error.", false));
    }
  });

  app.post("/api/admin/google-calendar/disconnect", async (req: Request, res: Response) => {
    try {
      if (!(await requireAdminSession(req, res))) return;

      await storage.deleteGoogleCalendarConnection();
      res.json({ success: true });
    } catch (error) {
      console.error("Google disconnect error:", error);
      res.status(500).json({ error: "Failed to disconnect Google Calendar." });
    }
  });

  app.post("/api/reviews", async (req: Request, res: Response) => {
    try {
      const parseResult = insertReviewSchema.safeParse(req.body);

      if (!parseResult.success) {
        return res.status(400).json({
          error: "Invalid review data",
          details: parseResult.error.errors,
        });
      }

      const review = await storage.createReview(parseResult.data);

      res.json({
        success: true,
        message: "Thank you for your review! It will be published after approval.",
        review,
      });
    } catch (error) {
      console.error("Review submission error:", error);
      res.status(500).json({ error: "Failed to submit review. Please try again." });
    }
  });

  app.get("/api/reviews/approved", async (_req: Request, res: Response) => {
    try {
      const reviews = await storage.getApprovedReviews();
      res.json(reviews);
    } catch (error) {
      console.error("Get approved reviews error:", error);
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  app.get("/api/admin/reviews", async (req: Request, res: Response) => {
    try {
      if (!(await requireAdminSession(req, res))) return;
      const reviews = await storage.getAllReviews();
      res.json(reviews);
    } catch (error) {
      console.error("Get all reviews error:", error);
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  app.get("/api/admin/reviews/pending", async (req: Request, res: Response) => {
    try {
      if (!(await requireAdminSession(req, res))) return;
      const reviews = await storage.getPendingReviews();
      res.json(reviews);
    } catch (error) {
      console.error("Get pending reviews error:", error);
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  app.patch("/api/admin/reviews/:id", async (req: Request, res: Response) => {
    try {
      if (!(await requireAdminSession(req, res))) return;

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

  app.post("/api/dispute-cases", async (req: Request, res: Response) => {
    try {
      const { insertDisputeCaseSchema } = await import("@shared/schema");
      const parseResult = insertDisputeCaseSchema.safeParse(req.body);

      if (!parseResult.success) {
        return res.status(400).json({
          error: "Invalid case data",
          details: parseResult.error.errors,
        });
      }

      const disputeCase = await storage.createDisputeCase(parseResult.data);

      res.json({
        success: true,
        message: "Your case has been submitted. We will review it and contact you within 24-48 hours.",
        disputeCase,
      });
    } catch (error) {
      console.error("Dispute case submission error:", error);
      res.status(500).json({ error: "Failed to submit case. Please try again." });
    }
  });

  app.post("/api/furniture-consultation", async (req: Request, res: Response) => {
    try {
      const { insertFurnitureConsultationSchema } = await import("@shared/schema");
      const parseResult = insertFurnitureConsultationSchema.safeParse(req.body);

      if (!parseResult.success) {
        return res.status(400).json({
          error: "Invalid consultation data",
          details: parseResult.error.errors,
        });
      }

      const consultation = await storage.createFurnitureConsultation(parseResult.data);

      res.json({
        success: true,
        message: "Your consultation request has been submitted. Our design team will contact you within 24-48 hours.",
        consultation,
      });
    } catch (error) {
      console.error("Furniture consultation submission error:", error);
      res.status(500).json({ error: "Failed to submit consultation request. Please try again." });
    }
  });

  app.get("/api/admin/dispute-cases", async (req: Request, res: Response) => {
    try {
      if (!(await requireAdminSession(req, res))) return;
      const cases = await storage.getAllDisputeCases();
      res.json(cases);
    } catch (error) {
      console.error("Get dispute cases error:", error);
      res.status(500).json({ error: "Failed to fetch cases" });
    }
  });

  startBookingMaintenanceLoop();

  return httpServer;
}
