import { EXPIRING_SOON_MS } from "./constants";
import type { ExpiryStatus } from "./types";

/** Coerce any expiry representation (Date | epoch s/ms | ISO string) to ISO. */
export function normalizeExpiry(value: unknown): string | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  }
  if (value === null || value === undefined || value === "") {
    return null;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    const millis = value > 100000000000 ? value : value * 1000;
    const date = new Date(millis);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }
    if (/^\d+$/.test(trimmed)) {
      return normalizeExpiry(Number(trimmed));
    }
    const date = new Date(trimmed);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
  return null;
}

export function getExpiryStatus(expiresAt: string | null, now: number = Date.now()): ExpiryStatus {
  if (!expiresAt) {
    return { status: "unknown", label: "未知" };
  }
  const time = new Date(expiresAt).getTime();
  if (Number.isNaN(time)) {
    return { status: "unknown", label: "未知" };
  }
  const remaining = time - now;
  if (remaining < 0) {
    return { status: "expired", label: "已过期" };
  }
  if (remaining <= EXPIRING_SOON_MS) {
    return { status: "expiringSoon", label: "即将过期" };
  }
  return { status: "valid", label: "有效" };
}

export function formatExpiry(expiresAt: string | null): string {
  if (!expiresAt) {
    return "未知";
  }
  const date = new Date(expiresAt);
  if (Number.isNaN(date.getTime())) {
    return "未知";
  }
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function calculateExpiresIn(value: string | null, now: number = Date.now()): number | null {
  if (!value) {
    return null;
  }
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) {
    return null;
  }
  return Math.max(0, Math.floor((time - now) / 1000));
}

export function oneHourBefore(value: string | null): string | null {
  const time = value ? new Date(value).getTime() : NaN;
  if (Number.isNaN(time)) {
    return new Date().toISOString();
  }
  return new Date(time - 3600 * 1000).toISOString();
}
