// Small pure helpers shared across the core. No DOM, no side effects.

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === "[object Object]";
}

export function stringOrNull(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || null;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return null;
}

export function getByPath(object: unknown, path: string): unknown {
  if (!object || typeof object !== "object") {
    return undefined;
  }

  const record = object as Record<string, unknown>;
  if (Object.prototype.hasOwnProperty.call(record, path)) {
    return record[path];
  }

  const parts = path.split(".");
  let cursor: unknown = object;
  for (const part of parts) {
    if (
      !cursor ||
      typeof cursor !== "object" ||
      !Object.prototype.hasOwnProperty.call(cursor, part)
    ) {
      return undefined;
    }
    cursor = (cursor as Record<string, unknown>)[part];
  }
  return cursor;
}

export function pickFirstValue(object: unknown, paths: string[]): unknown {
  for (const path of paths) {
    const value = getByPath(object, path);
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return null;
}

export function pickFirstString(object: unknown, paths: string[]): string | null {
  return stringOrNull(pickFirstValue(object, paths));
}

export function firstString(values: unknown[]): string | null {
  for (const value of values) {
    const text = stringOrNull(value);
    if (text) {
      return text;
    }
  }
  return null;
}

export function appendPath(path: string, key: string): string {
  if (/^[A-Za-z_$][\w$-]*$/.test(key)) {
    return `${path}.${key}`;
  }
  return `${path}[${JSON.stringify(key)}]`;
}

export function toPositiveInteger(value: unknown): number | null {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) {
    return null;
  }
  return Math.trunc(number);
}

export function stripBom(text: unknown): string {
  return String(text ?? "").replace(/^﻿/, "");
}

export function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function hashString(value: unknown): string {
  let hash = 2166136261;
  const text = String(value ?? "");
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function slugify(value: unknown): string {
  return (
    String(value ?? "account")
      .trim()
      .toLowerCase()
      .replace(/@/g, "-at-")
      .replace(/[^a-z0-9一-龥]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 54) || "account"
  );
}

export function createEmailKey(email: string | null): string | null {
  if (!email) {
    return null;
  }
  return String(email)
    .toLowerCase()
    .replace(/@/g, "_")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function coerceUnixSeconds(value: unknown): number {
  if (value === null || value === undefined || value === "") {
    return 0;
  }
  const number = Number(value);
  if (Number.isFinite(number)) {
    return Math.trunc(number > 100000000000 ? number / 1000 : number);
  }
  const time = Date.parse(String(value));
  return Number.isFinite(time) ? Math.trunc(time / 1000) : 0;
}

// ---- object cleaning ------------------------------------------------------

/** Recursively drop null / undefined / "" and prune empty objects & arrays. */
export function cleanOriginalObject(value: unknown): unknown {
  if (Array.isArray(value)) {
    const array = value.map(cleanOriginalObject).filter((item) => item !== undefined);
    return array.length ? array : undefined;
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value)
      .map(([key, child]) => [key, cleanOriginalObject(child)] as const)
      .filter(([, child]) => child !== undefined);
    return entries.length ? Object.fromEntries(entries) : undefined;
  }

  if (value === null || value === undefined || value === "") {
    return undefined;
  }
  return value;
}

/** Shallow: drop only null / undefined keys. */
export function omitNullishObject(value: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(value).filter(([, child]) => child !== null && child !== undefined),
  );
}
