// Framework-agnostic type definitions for the conversion core.
// Nothing here imports React or touches the DOM — the whole `core/` folder is a
// pure library that can be reused from a CLI, a worker, or tests.

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
export type JsonRecord = Record<string, unknown>;

export type TargetId =
  | "sub2api"
  | "cpa"
  | "cockpit"
  | "9router"
  | "codex"
  | "axonhub"
  | "codex-manager";

export interface TargetMeta {
  id: TargetId;
  label: string;
  /** One-line description shown in the UI. */
  blurb: string;
}

export type ExpiryStatusId = "valid" | "expiringSoon" | "expired" | "unknown";

export interface ExpiryStatus {
  status: ExpiryStatusId;
  label: string;
}

/** A credential source: either pasted text or a loaded file. */
export interface Source {
  name: string;
  text: string;
}

/** A single normalized account extracted from arbitrary session JSON. */
export interface NormalizedAccount {
  id: string;
  source: string;
  path: string;
  sourceType: string;
  outputSource: string;
  email: string | null;
  name: string | null;
  accessToken: string;
  sessionToken: string | null;
  refreshToken: string | null;
  idToken: string | null;
  effectiveIdToken: string | null;
  idTokenSynthetic: boolean;
  accountId: string | null;
  chatgptAccountId: string | null;
  codexManagerAccountId: string | null;
  workspaceId: string | null;
  chatgptUserId: string | null;
  planType: string | null;
  accessTokenExpiresAt: number | null;
  expiresAt: string | null;
  lastRefresh: string | null;
  disabled: boolean;
  priority: number;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  accountNote: string | null;
  authProvider: string | null;
  raw: unknown;
}

export interface SkippedItem {
  path: string;
  reason: string;
  valuePreview: string;
}

/** Result of parsing one or more sources. */
export interface ParseResult {
  accounts: NormalizedAccount[];
  skipped: SkippedItem[];
}

export type Converter = (account: NormalizedAccount) => JsonValue;
