// Secret-safe previews for the "skipped" panel — never surface full tokens.

import { TOKEN_FIELD_HINTS } from "./constants";
import { isPlainObject, stringOrNull } from "./utils";

export function maskSecret(value: unknown): string {
  const text = stringOrNull(value);
  if (!text) {
    return "无";
  }
  if (text.length <= 10) {
    return "******";
  }
  return `${text.slice(0, 6)}...${text.slice(-4)}`;
}

function isSecretKey(key: string): boolean {
  const normalized = key.toLowerCase();
  return TOKEN_FIELD_HINTS.some((hint) => normalized.includes(hint));
}

function redactSecrets(value: unknown, depth = 0): unknown {
  if (depth > 3) {
    return "...";
  }
  if (Array.isArray(value)) {
    return value.slice(0, 5).map((item) => redactSecrets(item, depth + 1));
  }
  if (!isPlainObject(value)) {
    return typeof value === "string" && value.length > 24 ? maskSecret(value) : value;
  }
  const output: Record<string, unknown> = {};
  Object.entries(value)
    .slice(0, 16)
    .forEach(([key, child]) => {
      output[key] = isSecretKey(key) ? maskSecret(child) : redactSecrets(child, depth + 1);
    });
  return output;
}

export function createSafePreview(value: unknown): string {
  try {
    const preview = JSON.stringify(redactSecrets(value), null, 0);
    return preview.length > 180 ? `${preview.slice(0, 180)}...` : preview;
  } catch {
    return "无法生成预览";
  }
}
