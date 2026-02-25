import { createHash, createHmac, randomBytes } from "crypto";

export type BookingAction = "approve" | "reject";

interface SignedActionPayload {
  bookingRequestId: string;
  action: BookingAction;
  expiresAt: string;
  nonce: string;
}

function getSecret(): string {
  const secret = process.env.BOOKING_ACTION_TOKEN_SECRET;
  if (!secret) {
    throw new Error("BOOKING_ACTION_TOKEN_SECRET must be set");
  }
  return secret;
}

function toBase64Url(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(payloadBase64: string): string {
  return createHmac("sha256", getSecret()).update(payloadBase64).digest("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function createSignedActionToken(
  bookingRequestId: string,
  action: BookingAction,
  expiresAt: Date,
): { token: string; tokenHash: string; payload: SignedActionPayload } {
  const payload: SignedActionPayload = {
    bookingRequestId,
    action,
    expiresAt: expiresAt.toISOString(),
    nonce: randomBytes(12).toString("hex"),
  };

  const payloadBase64 = toBase64Url(JSON.stringify(payload));
  const signature = sign(payloadBase64);
  const token = `${payloadBase64}.${signature}`;

  return {
    token,
    tokenHash: hashToken(token),
    payload,
  };
}

export function verifySignedActionToken(token: string): SignedActionPayload | null {
  const [payloadBase64, providedSignature] = token.split(".");
  if (!payloadBase64 || !providedSignature) {
    return null;
  }

  const expectedSignature = sign(payloadBase64);
  if (providedSignature !== expectedSignature) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(payloadBase64)) as SignedActionPayload;

    if (!payload.bookingRequestId || !payload.action || !payload.expiresAt || !payload.nonce) {
      return null;
    }

    if (!["approve", "reject"].includes(payload.action)) {
      return null;
    }

    const expiresAt = new Date(payload.expiresAt);
    if (Number.isNaN(expiresAt.getTime())) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
