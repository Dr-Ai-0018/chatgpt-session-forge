// Public API of the conversion core. The UI imports only from here.

export * from "./types";
export { TARGETS, DEMO_INPUT, MAX_FILE_SIZE, EXPIRING_SOON_MS } from "./constants";
export { parseSources, parseJsonInput } from "./extract";
export { convertAccounts, convertOne } from "./converters";
export { decodeJwtPayload, decodeJwt } from "./jwt";
export type { DecodedJwt } from "./jwt";
export {
  normalizeExpiry,
  getExpiryStatus,
  formatExpiry,
  calculateExpiresIn,
} from "./expiry";
export { maskSecret } from "./redact";
import { TARGETS } from "./constants";
import { pad2 } from "./utils";
import type { TargetId } from "./types";

export function getTargetLabel(targetId: string): string {
  return (TARGETS.find((t) => t.id === targetId) || TARGETS[0]).label;
}

export function createDownloadFilename(target: TargetId, now: Date = new Date()): string {
  const stamp = [
    now.getFullYear(),
    pad2(now.getMonth() + 1),
    pad2(now.getDate()),
    "-",
    pad2(now.getHours()),
    pad2(now.getMinutes()),
    pad2(now.getSeconds()),
  ].join("");
  return `chatgpt-session-${target}-${stamp}.json`;
}
