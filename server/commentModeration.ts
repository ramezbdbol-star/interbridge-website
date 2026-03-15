import { createHash } from "crypto";

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY?.trim() || "";

const suspiciousPatterns = [
  /https?:\/\//i,
  /whatsapp/i,
  /telegram/i,
  /crypto/i,
  /bonus/i,
  /viagra/i,
  /casino/i,
];

export function hashIpAddress(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

export function computeSpamScore(body: string, email: string | null | undefined): number {
  let score = 0;

  suspiciousPatterns.forEach((pattern) => {
    if (pattern.test(body) || (email && pattern.test(email))) {
      score += 0.18;
    }
  });

  if (body.length < 12) score += 0.2;
  if ((body.match(/[A-Z]/g) || []).length > body.length / 2) score += 0.2;
  if ((body.match(/!/g) || []).length > 3) score += 0.12;

  return Math.min(1, score);
}

export async function verifyTurnstileToken(token: string, ip: string): Promise<boolean> {
  if (!TURNSTILE_SECRET_KEY) {
    return true;
  }

  if (!token) {
    return false;
  }

  const body = new URLSearchParams({
    secret: TURNSTILE_SECRET_KEY,
    response: token,
    remoteip: ip,
  });

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!response.ok) return false;
    const data = (await response.json()) as { success?: boolean };
    return !!data.success;
  } catch (error) {
    console.warn("Turnstile verification failed:", error);
    return false;
  }
}
