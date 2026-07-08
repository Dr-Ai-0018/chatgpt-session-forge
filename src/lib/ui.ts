import type { CSSProperties } from "react";
import type { ExpiryStatusId } from "../core";

/** Status → colour. `expiringSoon` follows the active accent so it never clashes. */
export function statusColor(status: ExpiryStatusId): string {
  switch (status) {
    case "valid":
      return "#46c8b0";
    case "expiringSoon":
      return "var(--acc)";
    case "expired":
      return "#e5544e";
    default:
      return "#8f887a";
  }
}

/** Status → i18n key. */
export function statusKey(status: ExpiryStatusId): string {
  switch (status) {
    case "valid":
      return "st_valid";
    case "expiringSoon":
      return "st_soon";
    case "expired":
      return "st_expired";
    default:
      return "st_unknown";
  }
}

/** ISO → "YYYY-MM-DD HH:MM". */
export function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "—";
  return new Date(t).toISOString().slice(0, 16).replace("T", " ");
}

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** CSS custom property helper for TS-safe inline `--acc`. */
export function cssVars(vars: Record<string, string>): CSSProperties {
  return vars as CSSProperties;
}
