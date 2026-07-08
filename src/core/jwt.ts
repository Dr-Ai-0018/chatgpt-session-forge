// JWT payload decoding + synthetic id_token minting.
// Uses global atob/btoa/TextEncoder (present in browsers and Node 18+).

import { coerceUnixSeconds } from "./utils";
import { isPlainObject } from "./utils";

export interface DecodedPayload {
  [key: string]: unknown;
}

export function decodeJwtPayload(token: unknown): DecodedPayload | null {
  if (typeof token !== "string" || token.split(".").length < 2) {
    return null;
  }
  try {
    const payload = token.split(".")[1];
    const base64 = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(payload.length / 4) * 4, "=");
    return JSON.parse(atob(base64)) as DecodedPayload;
  } catch {
    return null;
  }
}

export interface DecodedJwt {
  header: DecodedPayload | null;
  payload: DecodedPayload | null;
  signature: string;
}

/** Decode a JWT into its header, payload, and (raw) signature segment. */
export function decodeJwt(token: unknown): DecodedJwt | null {
  if (typeof token !== "string") {
    return null;
  }
  const parts = token.split(".");
  if (parts.length < 2) {
    return null;
  }
  const header = decodeSegment(parts[0]);
  const payload = decodeSegment(parts[1]);
  if (!header && !payload) {
    return null;
  }
  return { header, payload, signature: parts[2] || "" };
}

function decodeSegment(segment: string): DecodedPayload | null {
  try {
    const base64 = segment
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(segment.length / 4) * 4, "=");
    return JSON.parse(atob(base64)) as DecodedPayload;
  } catch {
    return null;
  }
}

export function getOpenAiAuth(payload: DecodedPayload | null): Record<string, unknown> {
  const value = payload && payload["https://api.openai.com/auth"];
  return isPlainObject(value) ? value : {};
}

export function getOpenAiProfile(payload: DecodedPayload | null): Record<string, unknown> {
  const value = payload && payload["https://api.openai.com/profile"];
  return isPlainObject(value) ? value : {};
}

function base64UrlJson(value: unknown): string {
  const json = JSON.stringify(value);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 32768) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 32768));
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

/**
 * When a session lacks an id_token but we know the account id, synthesize an
 * unsigned JWT (alg: none) carrying the OpenAI auth claims some targets need.
 * Returns null when there is no account id to anchor it.
 */
export function createSyntheticIdToken(
  email: string | null,
  accountId: string | null,
  planType: string | null,
  userId: string | null,
  expiresAt: string | null,
  now: number,
): string | null {
  if (!accountId) {
    return null;
  }

  const auth: Record<string, unknown> = { chatgpt_account_id: accountId };
  const expires = coerceUnixSeconds(expiresAt) || now + 2160 * 60 * 60;
  if (planType) {
    auth.chatgpt_plan_type = planType;
  }
  if (userId) {
    auth.chatgpt_user_id = userId;
    auth.user_id = userId;
  }

  const payload: Record<string, unknown> = {
    iat: now,
    exp: expires,
    "https://api.openai.com/auth": auth,
  };
  if (email) {
    payload.email = email;
  }

  return `${base64UrlJson({ alg: "none", typ: "JWT", cpa_synthetic: true })}.${base64UrlJson(
    payload,
  )}.synthetic`;
}
