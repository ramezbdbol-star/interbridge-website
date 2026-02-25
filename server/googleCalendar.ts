import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3";
const GOOGLE_USERINFO_API = "https://www.googleapis.com/oauth2/v2/userinfo";

const GOOGLE_SCOPES = [
  "openid",
  "email",
  "https://www.googleapis.com/auth/calendar",
].join(" ");

function getOauthConfig() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Google OAuth env vars are missing");
  }

  return { clientId, clientSecret, redirectUri };
}

function getEncryptionKey(): Buffer {
  const sourceKey = process.env.GOOGLE_TOKEN_ENCRYPTION_KEY;
  if (!sourceKey) {
    throw new Error("GOOGLE_TOKEN_ENCRYPTION_KEY must be set");
  }

  return createHash("sha256").update(sourceKey).digest();
}

export function hasGoogleOauthConfig(): boolean {
  return !!(
    process.env.GOOGLE_OAUTH_CLIENT_ID &&
    process.env.GOOGLE_OAUTH_CLIENT_SECRET &&
    process.env.GOOGLE_OAUTH_REDIRECT_URI &&
    process.env.GOOGLE_TOKEN_ENCRYPTION_KEY
  );
}

export function encryptToken(value: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);

  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [iv.toString("base64url"), authTag.toString("base64url"), encrypted.toString("base64url")].join(".");
}

export function decryptToken(payload: string): string {
  const [ivEncoded, tagEncoded, encryptedEncoded] = payload.split(".");
  if (!ivEncoded || !tagEncoded || !encryptedEncoded) {
    throw new Error("Invalid encrypted token format");
  }

  const key = getEncryptionKey();
  const iv = Buffer.from(ivEncoded, "base64url");
  const authTag = Buffer.from(tagEncoded, "base64url");
  const encrypted = Buffer.from(encryptedEncoded, "base64url");

  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}

export function buildGoogleConnectUrl(state: string): string {
  const { clientId, redirectUri } = getOauthConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: GOOGLE_SCOPES,
    access_type: "offline",
    include_granted_scopes: "true",
    prompt: "consent",
    state,
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

interface TokenExchangeResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
}

async function exchangeToken(params: URLSearchParams): Promise<TokenExchangeResponse> {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google token exchange failed (${response.status}): ${text}`);
  }

  return await response.json();
}

export async function exchangeCodeForTokens(code: string): Promise<{
  accessToken: string;
  refreshToken: string;
  tokenExpiry: Date;
}> {
  const { clientId, clientSecret, redirectUri } = getOauthConfig();
  const params = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  const result = await exchangeToken(params);

  if (!result.refresh_token) {
    throw new Error("Google OAuth did not return a refresh token. Reconnect with consent prompt.");
  }

  return {
    accessToken: result.access_token,
    refreshToken: result.refresh_token,
    tokenExpiry: new Date(Date.now() + result.expires_in * 1000),
  };
}

export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  tokenExpiry: Date;
}> {
  const { clientId, clientSecret } = getOauthConfig();
  const params = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
  });

  const result = await exchangeToken(params);

  return {
    accessToken: result.access_token,
    tokenExpiry: new Date(Date.now() + result.expires_in * 1000),
  };
}

export async function getGoogleUserEmail(accessToken: string): Promise<string> {
  const response = await fetch(GOOGLE_USERINFO_API, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch Google profile (${response.status}): ${text}`);
  }

  const data = (await response.json()) as { email?: string };
  if (!data.email) {
    throw new Error("Google profile email is missing");
  }

  return data.email;
}

interface CalendarEventTime {
  dateTime: string;
  timeZone: string;
}

interface HoldEventInput {
  calendarId: string;
  startAtUtc: Date;
  endAtUtc: Date;
  title: string;
  description: string;
}

interface ConfirmEventInput {
  calendarId: string;
  holdEventId?: string | null;
  startAtUtc: Date;
  endAtUtc: Date;
  title: string;
  description: string;
  attendeeEmail: string;
  needsMeetLink: boolean;
}

interface GoogleEventResponse {
  id?: string;
  status?: string;
}

async function calendarRequest<T>(
  accessToken: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${GOOGLE_CALENDAR_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google Calendar API error (${response.status}): ${text}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
}

export async function checkCalendarBusy(
  accessToken: string,
  calendarId: string,
  startAtUtc: Date,
  endAtUtc: Date,
): Promise<boolean> {
  const response = await calendarRequest<{
    calendars?: Record<string, { busy?: Array<{ start: string; end: string }> }>;
  }>(
    accessToken,
    "/freeBusy",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        timeMin: startAtUtc.toISOString(),
        timeMax: endAtUtc.toISOString(),
        items: [{ id: calendarId || "primary" }],
      }),
    },
  );

  const busy = response.calendars?.[calendarId || "primary"]?.busy || [];
  return busy.length > 0;
}

export async function createHoldEvent(accessToken: string, input: HoldEventInput): Promise<string> {
  const payload = {
    summary: input.title,
    description: input.description,
    status: "tentative",
    transparency: "opaque",
    start: {
      dateTime: input.startAtUtc.toISOString(),
      timeZone: "UTC",
    } satisfies CalendarEventTime,
    end: {
      dateTime: input.endAtUtc.toISOString(),
      timeZone: "UTC",
    } satisfies CalendarEventTime,
  };

  const event = await calendarRequest<GoogleEventResponse>(
    accessToken,
    `/calendars/${encodeURIComponent(input.calendarId)}/events?sendUpdates=none`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!event.id) {
    throw new Error("Google Calendar did not return an event id for hold event");
  }

  return event.id;
}

export async function confirmBookingEvent(accessToken: string, input: ConfirmEventInput): Promise<string> {
  const basePayload = {
    summary: input.title,
    description: input.description,
    status: "confirmed",
    start: {
      dateTime: input.startAtUtc.toISOString(),
      timeZone: "UTC",
    } satisfies CalendarEventTime,
    end: {
      dateTime: input.endAtUtc.toISOString(),
      timeZone: "UTC",
    } satisfies CalendarEventTime,
    attendees: [{ email: input.attendeeEmail }],
    conferenceData: input.needsMeetLink
      ? {
          createRequest: {
            requestId: randomBytes(8).toString("hex"),
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        }
      : undefined,
  };

  const query = input.needsMeetLink ? "sendUpdates=all&conferenceDataVersion=1" : "sendUpdates=all";

  if (input.holdEventId) {
    const updated = await calendarRequest<GoogleEventResponse>(
      accessToken,
      `/calendars/${encodeURIComponent(input.calendarId)}/events/${encodeURIComponent(input.holdEventId)}?${query}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(basePayload),
      },
    );

    if (!updated.id) {
      throw new Error("Google Calendar patch did not return event id");
    }

    return updated.id;
  }

  const created = await calendarRequest<GoogleEventResponse>(
    accessToken,
    `/calendars/${encodeURIComponent(input.calendarId)}/events?${query}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(basePayload),
    },
  );

  if (!created.id) {
    throw new Error("Google Calendar create did not return event id");
  }

  return created.id;
}

export async function cancelCalendarEvent(
  accessToken: string,
  calendarId: string,
  eventId: string,
  sendUpdates: "none" | "all" = "none",
): Promise<void> {
  await calendarRequest<{}>(
    accessToken,
    `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}?sendUpdates=${sendUpdates}`,
    {
      method: "DELETE",
    },
  );
}
