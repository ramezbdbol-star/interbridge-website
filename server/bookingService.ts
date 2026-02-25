import type { BookingRequest, NewBookingRequest } from "@shared/schema";
import { storage } from "./storage";
import {
  cancelCalendarEvent,
  checkCalendarBusy,
  confirmBookingEvent,
  createHoldEvent,
  decryptToken,
  encryptToken,
  refreshAccessToken,
} from "./googleCalendar";
import { BookingAction, createSignedActionToken } from "./secureTokens";

const SHANGHAI_TIMEZONE = "Asia/Shanghai";
const WORK_START_MINUTES = 7 * 60;
const WORK_END_MINUTES = 21 * 60;
const MIN_DURATION_HOURS = 4;
const MAX_DURATION_HOURS = 12;
const HOLD_EXPIRY_HOURS = 6;

type DecisionSource = "email_link" | "admin_panel";

interface TimeParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

export interface BookingSubmissionPayload {
  name?: string;
  email?: string;
  phone?: string;
  purpose?: string;
  notes?: string;
  startAt?: string;
  endAt?: string;
  visitorTimezone?: string;
  needsMeetLink?: boolean;
  isUrgent?: boolean;
}

interface NormalizedBookingInput {
  name: string | null;
  email: string | null;
  phone: string | null;
  purpose: string | null;
  notes: string | null;
  startAtUtc: Date;
  endAtUtc: Date;
  visitorTimezone: string;
  needsMeetLink: boolean;
  isUrgent: boolean;
  outsideWorkingWindow: boolean;
}

interface CalendarContext {
  connected: boolean;
  reachable: boolean;
  accessToken?: string;
  calendarId: string;
  reason?: string;
}

export interface BookingValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  hasConflict: boolean;
  isOutsideWorkingWindow: boolean;
  requiresUrgent: boolean;
  googleConnected: boolean;
  googleReachable: boolean;
}

export interface BookingCreationResult {
  booking: BookingRequest;
  approveToken: string;
  rejectToken: string;
  warnings: string[];
}

export class BookingValidationError extends Error {
  public readonly errors: string[];

  constructor(errors: string[]) {
    super(errors.join("; "));
    this.errors = errors;
  }
}

function sanitizeOptionalText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseDate(value: unknown): Date | null {
  if (typeof value !== "string") return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function ensureTimezone(value: unknown): string | null {
  if (typeof value !== "string" || value.trim().length === 0) return null;
  const timezone = value.trim();

  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format(new Date());
    return timezone;
  } catch {
    return null;
  }
}

function getTimeParts(date: Date, timeZone: string): TimeParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
  };
}

function isSameDate(a: TimeParts, b: TimeParts): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

function computeOutsideWorkingWindow(startAtUtc: Date, endAtUtc: Date): boolean {
  const start = getTimeParts(startAtUtc, SHANGHAI_TIMEZONE);
  const end = getTimeParts(endAtUtc, SHANGHAI_TIMEZONE);

  const sameDay = isSameDate(start, end);
  const startMinutes = start.hour * 60 + start.minute;
  const endMinutes = end.hour * 60 + end.minute;

  const insideWindow = sameDay && startMinutes >= WORK_START_MINUTES && endMinutes <= WORK_END_MINUTES;
  return !insideWindow;
}

function formatBookingTitle(prefix: "PENDING" | "CONFIRMED", booking: NormalizedBookingInput): string {
  const label = booking.name || booking.email || booking.phone || "Unnamed Client";
  return `[${prefix}] Book Now - ${label}`;
}

function formatBookingDescription(booking: NormalizedBookingInput): string {
  return [
    "Book Now request from website",
    `Name: ${booking.name || "(not provided)"}`,
    `Email: ${booking.email || "(not provided)"}`,
    `Phone: ${booking.phone || "(not provided)"}`,
    `Purpose: ${booking.purpose || "(not provided)"}`,
    `Notes: ${booking.notes || "(not provided)"}`,
    `Urgent Booking: ${booking.isUrgent ? "Yes" : "No"}`,
    `Visitor Timezone: ${booking.visitorTimezone}`,
  ].join("\n");
}

function normalizeCoreInput(payload: BookingSubmissionPayload): {
  normalized: NormalizedBookingInput | null;
  errors: string[];
} {
  const errors: string[] = [];

  const startAtUtc = parseDate(payload.startAt);
  const endAtUtc = parseDate(payload.endAt);
  const visitorTimezone = ensureTimezone(payload.visitorTimezone);

  const name = sanitizeOptionalText(payload.name);
  const email = sanitizeOptionalText(payload.email);
  const phone = sanitizeOptionalText(payload.phone);
  const purpose = sanitizeOptionalText(payload.purpose);
  const notes = sanitizeOptionalText(payload.notes);

  if (!startAtUtc || !endAtUtc) {
    errors.push("Start time and end time are required.");
  }

  if (!visitorTimezone) {
    errors.push("A valid visitor timezone is required.");
  }

  if (!email && !phone) {
    errors.push("Please provide at least one contact method: email or phone.");
  }

  if (startAtUtc && endAtUtc && startAtUtc >= endAtUtc) {
    errors.push("End time must be after start time.");
  }

  if (startAtUtc && endAtUtc) {
    const durationHours = (endAtUtc.getTime() - startAtUtc.getTime()) / (1000 * 60 * 60);
    if (durationHours < MIN_DURATION_HOURS) {
      errors.push("Minimum booking duration is 4 hours.");
    }
    if (durationHours > MAX_DURATION_HOURS) {
      errors.push("Maximum booking duration is 12 hours.");
    }
  }

  if (startAtUtc && endAtUtc && visitorTimezone) {
    const startParts = getTimeParts(startAtUtc, visitorTimezone);
    const endParts = getTimeParts(endAtUtc, visitorTimezone);

    if (startParts.minute !== 0 || endParts.minute !== 0) {
      errors.push("Bookings must use 60-minute increments.");
    }
  }

  if (errors.length > 0 || !startAtUtc || !endAtUtc || !visitorTimezone) {
    return { normalized: null, errors };
  }

  const outsideWorkingWindow = computeOutsideWorkingWindow(startAtUtc, endAtUtc);
  const isUrgent = !!payload.isUrgent;

  if (outsideWorkingWindow && !isUrgent) {
    errors.push("Bookings outside 7:00 AM to 9:00 PM (Asia/Shanghai) require urgent booking.");
  }

  return {
    normalized: {
      name,
      email,
      phone,
      purpose,
      notes,
      startAtUtc,
      endAtUtc,
      visitorTimezone,
      needsMeetLink: !!payload.needsMeetLink,
      isUrgent,
      outsideWorkingWindow,
    },
    errors,
  };
}

async function getCalendarContext(): Promise<CalendarContext> {
  const connection = await storage.getGoogleCalendarConnection();
  if (!connection) {
    return {
      connected: false,
      reachable: false,
      calendarId: "primary",
      reason: "Google Calendar is not connected.",
    };
  }

  const calendarId = connection.calendarId || "primary";

  try {
    let accessToken: string | undefined;
    const now = Date.now();

    if (
      connection.accessTokenEncrypted &&
      connection.tokenExpiry &&
      connection.tokenExpiry.getTime() - now > 60 * 1000
    ) {
      accessToken = decryptToken(connection.accessTokenEncrypted);
    } else {
      const refreshToken = decryptToken(connection.refreshTokenEncrypted);
      const refreshed = await refreshAccessToken(refreshToken);

      accessToken = refreshed.accessToken;

      await storage.upsertGoogleCalendarConnection({
        googleEmail: connection.googleEmail,
        calendarId,
        refreshTokenEncrypted: connection.refreshTokenEncrypted,
        accessTokenEncrypted: encryptToken(refreshed.accessToken),
        tokenExpiry: refreshed.tokenExpiry,
      });
    }

    return {
      connected: true,
      reachable: true,
      accessToken,
      calendarId,
    };
  } catch (error) {
    console.error("Google Calendar context error:", error);
    return {
      connected: true,
      reachable: false,
      calendarId,
      reason: "Google Calendar is connected but currently unreachable.",
    };
  }
}

async function checkConflictWithCalendar(
  startAtUtc: Date,
  endAtUtc: Date,
): Promise<{ conflict: boolean; context: CalendarContext }> {
  const context = await getCalendarContext();

  if (!context.connected || !context.reachable || !context.accessToken) {
    return { conflict: false, context };
  }

  try {
    const busy = await checkCalendarBusy(context.accessToken, context.calendarId, startAtUtc, endAtUtc);
    return { conflict: busy, context };
  } catch (error) {
    console.error("Google free/busy check failed:", error);
    return {
      conflict: false,
      context: {
        ...context,
        reachable: false,
        reason: "Google Calendar free/busy check failed.",
      },
    };
  }
}

function toNewBookingRecord(input: NormalizedBookingInput): NewBookingRequest {
  return {
    status: "pending",
    name: input.name,
    email: input.email,
    phone: input.phone,
    purpose: input.purpose,
    notes: input.notes,
    needsMeetLink: input.needsMeetLink,
    isUrgent: input.isUrgent,
    visitorTimezone: input.visitorTimezone,
    startAtUtc: input.startAtUtc,
    endAtUtc: input.endAtUtc,
    holdEventId: null,
    holdStatus: "missing",
    holdExpiresAt: new Date(Date.now() + HOLD_EXPIRY_HOURS * 60 * 60 * 1000),
    decidedAt: null,
    decisionSource: null,
    updatedAt: new Date(),
  };
}

async function createActionTokens(bookingRequestId: string, expiresAt: Date): Promise<{
  approveToken: string;
  rejectToken: string;
}> {
  const approve = createSignedActionToken(bookingRequestId, "approve", expiresAt);
  const reject = createSignedActionToken(bookingRequestId, "reject", expiresAt);

  await storage.createBookingActionToken({
    bookingRequestId,
    action: "approve",
    tokenHash: approve.tokenHash,
    expiresAt,
  });

  await storage.createBookingActionToken({
    bookingRequestId,
    action: "reject",
    tokenHash: reject.tokenHash,
    expiresAt,
  });

  return {
    approveToken: approve.token,
    rejectToken: reject.token,
  };
}

export async function validateBookingPayload(
  payload: BookingSubmissionPayload,
): Promise<BookingValidationResult> {
  const { normalized, errors } = normalizeCoreInput(payload);

  if (!normalized || errors.length > 0) {
    return {
      valid: false,
      errors,
      warnings: [],
      hasConflict: false,
      isOutsideWorkingWindow: normalized?.outsideWorkingWindow ?? false,
      requiresUrgent: normalized?.outsideWorkingWindow ?? false,
      googleConnected: false,
      googleReachable: false,
    };
  }

  const warnings: string[] = [];
  const conflictCheck = await checkConflictWithCalendar(normalized.startAtUtc, normalized.endAtUtc);

  if (!conflictCheck.context.connected) {
    warnings.push("Google Calendar is not connected yet; conflict checking is unavailable.");
  } else if (!conflictCheck.context.reachable) {
    warnings.push(conflictCheck.context.reason || "Google Calendar is temporarily unreachable.");
  }

  if (conflictCheck.conflict) {
    errors.push("The selected time conflicts with an existing calendar event.");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    hasConflict: conflictCheck.conflict,
    isOutsideWorkingWindow: normalized.outsideWorkingWindow,
    requiresUrgent: normalized.outsideWorkingWindow,
    googleConnected: conflictCheck.context.connected,
    googleReachable: conflictCheck.context.reachable,
  };
}

export async function createPendingBooking(payload: BookingSubmissionPayload): Promise<BookingCreationResult> {
  const { normalized, errors } = normalizeCoreInput(payload);

  if (!normalized || errors.length > 0) {
    throw new BookingValidationError(errors.length > 0 ? errors : ["Invalid booking payload."]);
  }

  const warnings: string[] = [];
  const conflictCheck = await checkConflictWithCalendar(normalized.startAtUtc, normalized.endAtUtc);

  if (conflictCheck.conflict) {
    throw new BookingValidationError(["The selected time conflicts with an existing calendar event."]);
  }

  if (!conflictCheck.context.connected) {
    warnings.push("Google Calendar is not connected. Booking was saved without a temporary hold.");
  } else if (!conflictCheck.context.reachable) {
    warnings.push("Google Calendar is unreachable. Booking was saved and hold creation will retry automatically.");
  }

  const draftRecord = toNewBookingRecord(normalized);

  if (conflictCheck.context.connected && conflictCheck.context.reachable && conflictCheck.context.accessToken) {
    try {
      const holdEventId = await createHoldEvent(conflictCheck.context.accessToken, {
        calendarId: conflictCheck.context.calendarId,
        startAtUtc: normalized.startAtUtc,
        endAtUtc: normalized.endAtUtc,
        title: formatBookingTitle("PENDING", normalized),
        description: formatBookingDescription(normalized),
      });

      draftRecord.holdEventId = holdEventId;
      draftRecord.holdStatus = "created";
    } catch (error) {
      console.error("Hold event creation failed:", error);
      draftRecord.holdStatus = "missing";
      warnings.push("Google hold event could not be created immediately and will retry automatically.");
    }
  }

  const booking = await storage.createBookingRequest(draftRecord);
  const tokens = await createActionTokens(booking.id, booking.holdExpiresAt);

  return {
    booking,
    approveToken: tokens.approveToken,
    rejectToken: tokens.rejectToken,
    warnings,
  };
}

export async function applyBookingDecision(params: {
  bookingRequestId: string;
  action: BookingAction;
  source: DecisionSource;
  emailOverride?: string | null;
}): Promise<BookingRequest> {
  const booking = await storage.getBookingRequestById(params.bookingRequestId);
  if (!booking) {
    throw new Error("Booking request not found.");
  }

  if (booking.status !== "pending") {
    throw new Error(`Booking is already ${booking.status}.`);
  }

  if (booking.holdExpiresAt <= new Date()) {
    await expireBooking(booking);
    throw new Error("Booking request has expired.");
  }

  const updatedEmail = sanitizeOptionalText(params.emailOverride) ?? booking.email;

  if (params.action === "reject") {
    return await rejectBooking(booking, params.source);
  }

  if (!updatedEmail) {
    throw new Error("Email is required before approval so the client can receive a calendar invite.");
  }

  const calendarContext = await getCalendarContext();
  if (!calendarContext.connected) {
    throw new Error("Google Calendar is not connected.");
  }
  if (!calendarContext.reachable || !calendarContext.accessToken) {
    throw new Error("Google Calendar is temporarily unreachable. Please try again.");
  }

  const shouldRunConflictCheck = !booking.holdEventId || booking.holdStatus !== "created";
  if (shouldRunConflictCheck) {
    const busy = await checkCalendarBusy(
      calendarContext.accessToken,
      calendarContext.calendarId,
      booking.startAtUtc,
      booking.endAtUtc,
    );

    if (busy) {
      throw new Error("The booking time is no longer available in your calendar.");
    }
  }

  const normalized: NormalizedBookingInput = {
    name: booking.name,
    email: updatedEmail,
    phone: booking.phone,
    purpose: booking.purpose,
    notes: booking.notes,
    startAtUtc: booking.startAtUtc,
    endAtUtc: booking.endAtUtc,
    visitorTimezone: booking.visitorTimezone,
    needsMeetLink: booking.needsMeetLink,
    isUrgent: booking.isUrgent,
    outsideWorkingWindow: computeOutsideWorkingWindow(booking.startAtUtc, booking.endAtUtc),
  };

  const confirmedEventId = await confirmBookingEvent(calendarContext.accessToken, {
    calendarId: calendarContext.calendarId,
    holdEventId: booking.holdEventId,
    startAtUtc: booking.startAtUtc,
    endAtUtc: booking.endAtUtc,
    title: formatBookingTitle("CONFIRMED", normalized),
    description: formatBookingDescription(normalized),
    attendeeEmail: updatedEmail,
    needsMeetLink: booking.needsMeetLink,
  });

  const updatedBooking = await storage.updateBookingRequest(booking.id, {
    email: updatedEmail,
    status: "approved",
    holdEventId: confirmedEventId,
    holdStatus: "confirmed",
    decidedAt: new Date(),
    decisionSource: params.source,
  });

  await storage.invalidateBookingActionTokens(booking.id);

  if (!updatedBooking) {
    throw new Error("Failed to update booking decision.");
  }

  return updatedBooking;
}

async function rejectBooking(booking: BookingRequest, source: DecisionSource): Promise<BookingRequest> {
  let holdStatus: string = "released";

  if (booking.holdEventId) {
    const context = await getCalendarContext();
    if (context.connected && context.reachable && context.accessToken) {
      try {
        await cancelCalendarEvent(context.accessToken, context.calendarId, booking.holdEventId, "none");
      } catch (error) {
        console.error("Failed to release hold event during rejection:", error);
        holdStatus = "error";
      }
    } else {
      holdStatus = "error";
    }
  }

  const updatedBooking = await storage.updateBookingRequest(booking.id, {
    status: "rejected",
    holdStatus,
    decidedAt: new Date(),
    decisionSource: source,
  });

  await storage.invalidateBookingActionTokens(booking.id);

  if (!updatedBooking) {
    throw new Error("Failed to mark booking as rejected.");
  }

  return updatedBooking;
}

async function expireBooking(booking: BookingRequest): Promise<void> {
  let holdStatus: string = booking.holdEventId ? "released" : "missing";

  if (booking.holdEventId) {
    const context = await getCalendarContext();
    if (context.connected && context.reachable && context.accessToken) {
      try {
        await cancelCalendarEvent(context.accessToken, context.calendarId, booking.holdEventId, "none");
      } catch (error) {
        console.error("Failed to cancel hold event on expiry:", error);
        holdStatus = "error";
      }
    } else {
      holdStatus = "error";
    }
  }

  await storage.updateBookingRequest(booking.id, {
    status: "expired",
    holdStatus,
    decidedAt: new Date(),
    decisionSource: "admin_panel",
  });

  await storage.invalidateBookingActionTokens(booking.id);
}

async function retryMissingHold(booking: BookingRequest): Promise<void> {
  const context = await getCalendarContext();
  if (!context.connected || !context.reachable || !context.accessToken) {
    return;
  }

  try {
    const busy = await checkCalendarBusy(context.accessToken, context.calendarId, booking.startAtUtc, booking.endAtUtc);
    if (busy) {
      await storage.updateBookingRequest(booking.id, {
        holdStatus: "error",
      });
      return;
    }

    const normalized: NormalizedBookingInput = {
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      purpose: booking.purpose,
      notes: booking.notes,
      startAtUtc: booking.startAtUtc,
      endAtUtc: booking.endAtUtc,
      visitorTimezone: booking.visitorTimezone,
      needsMeetLink: booking.needsMeetLink,
      isUrgent: booking.isUrgent,
      outsideWorkingWindow: computeOutsideWorkingWindow(booking.startAtUtc, booking.endAtUtc),
    };

    const holdEventId = await createHoldEvent(context.accessToken, {
      calendarId: context.calendarId,
      startAtUtc: booking.startAtUtc,
      endAtUtc: booking.endAtUtc,
      title: formatBookingTitle("PENDING", normalized),
      description: formatBookingDescription(normalized),
    });

    await storage.updateBookingRequest(booking.id, {
      holdEventId,
      holdStatus: "created",
    });
  } catch (error) {
    console.error("Missing-hold retry failed:", error);
    await storage.updateBookingRequest(booking.id, {
      holdStatus: "error",
    });
  }
}

export async function processBookingMaintenance(): Promise<void> {
  const now = new Date();

  const expiring = await storage.getPendingBookingsNeedingExpiry(now);
  for (const booking of expiring) {
    await expireBooking(booking);
  }

  const missingHoldBookings = await storage.getPendingBookingsMissingHolds(now);
  for (const booking of missingHoldBookings) {
    await retryMissingHold(booking);
  }
}
