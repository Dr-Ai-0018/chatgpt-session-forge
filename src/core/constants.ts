import type { JsonValue, TargetMeta } from "./types";

export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const EXPIRING_SOON_MS = 7 * 24 * 60 * 60 * 1000;

export const TARGETS: TargetMeta[] = [
  { id: "sub2api", label: "Sub2API", blurb: "Sub2API 批量导入 JSON（含 credentials/extra）" },
  { id: "cpa", label: "CPA", blurb: "CPA 单账号 / 数组导入" },
  { id: "cockpit", label: "Cockpit", blurb: "Cockpit codex 账号条目" },
  { id: "9router", label: "9Router", blurb: "9Router provider 账号（oauth）" },
  { id: "codex", label: "Codex", blurb: "Codex auth.json（tokens 结构）" },
  { id: "axonhub", label: "AxonHub", blurb: "AxonHub auth（tokens + placeholder）" },
  { id: "codex-manager", label: "Codex-Manager", blurb: "Codex-Manager tokens + meta" },
];

export const TOKEN_FIELD_HINTS = ["token", "secret", "key", "authorization", "credential"];

export const ACCOUNT_CONTAINER_KEYS = new Set([
  "accounts",
  "sessions",
  "profiles",
  "items",
  "users",
  "credentials",
  "auths",
  "providers",
]);

export const TOKEN_CONTAINER_KEYS = new Set([
  "tokens",
  "credentials",
  "auth",
  "oauth",
  "session",
  "user",
  "profile",
  "account",
]);

export const FIELD_PATHS: Record<string, string[]> = {
  accessToken: [
    "accessToken",
    "access_token",
    "access-token",
    "token",
    "tokens.accessToken",
    "tokens.access_token",
    "credentials.accessToken",
    "credentials.access_token",
    "auth.accessToken",
    "auth.access_token",
    "oauth.accessToken",
    "oauth.access_token",
    "session.accessToken",
    "session.access_token",
  ],
  sessionToken: [
    "sessionToken",
    "session_token",
    "session-token",
    "__Secure-next-auth.session-token",
    "nextAuthSessionToken",
    "tokens.sessionToken",
    "tokens.session_token",
    "credentials.sessionToken",
    "credentials.session_token",
    "auth.sessionToken",
    "auth.session_token",
  ],
  refreshToken: [
    "refreshToken",
    "refresh_token",
    "refresh-token",
    "tokens.refreshToken",
    "tokens.refresh_token",
    "credentials.refreshToken",
    "credentials.refresh_token",
    "auth.refreshToken",
    "auth.refresh_token",
    "oauth.refreshToken",
    "oauth.refresh_token",
  ],
  email: [
    "email",
    "user.email",
    "account.email",
    "profile.email",
    "identity.email",
    "metadata.email",
    "owner.email",
  ],
  name: [
    "name",
    "user.name",
    "account.name",
    "profile.name",
    "identity.name",
    "metadata.name",
    "label",
  ],
  accountId: ["id", "accountId", "account_id", "user.id", "account.id", "profile.id", "sub"],
  expiry: [
    "expires",
    "expiresAt",
    "expires_at",
    "expiry",
    "expireTime",
    "expiration",
    "expirationTime",
    "expiresOn",
    "tokens.expires",
    "tokens.expiresAt",
    "tokens.expires_at",
    "auth.expiresAt",
    "credentials.expiresAt",
  ],
};

/** Offline demo payload matching /api/auth/session — all identities and tokens are fake. */
export const DEMO_INPUT: JsonValue = {
  WARNING_BANNER:
    "!!!!!!!!!!!!!!!!!!!! DO NOT SHARE ANY PART OF THE INFORMATION YOU SEE HERE. THIS INFORMATION IS SENSITIVE AND CAN GRANT ACCESS TO YOUR ACCOUNT. SHARING THIS INFORMATION IS LIKE SHARING YOUR PASSWORD. !!!!!!!!!!!!!!!!!!!!",
  user: {
    id: "user-demo-do-not-use",
    name: "Demo User",
    email: "demo@example.com",
    idp: "auth0",
    iat: 1751322000,
    amr: ["otp", "urn:openai:amr:otp_email"],
    mfa: false,
  },
  expires: "2099-12-31T23:59:59.000Z",
  account: {
    id: "acct-demo-do-not-use",
    planType: "k12",
    structure: "workspace",
    organizationId: "org-demo-do-not-use",
    workspaceType: "production",
    isUsageBasedSeatEnabled: false,
    isConversationClassifierEnabledForWorkspace: true,
    isFedrampCompliantWorkspace: false,
    isDelinquent: false,
    residencyRegion: "no_constraint",
    computeResidency: "no_constraint",
  },
  accessToken:
    "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJkZW1vIiwiaXNzIjoiY2hhdGdwdC1zZXNzaW9uLWZvcmdlIiwiaWF0IjoxNzUxMzIyMDAwLCJleHAiOjQxMDI0NDQ3OTl9.demo_signature_do_not_use",
  authProvider: "openai",
  sessionToken: "eyJkZW1vIjp0cnVlLCJ3YXJuaW5nIjoiZG9fbm90X3VzZSJ9.demo_session_token_do_not_use",
  rumViewTags: {
    light_account: {
      fetched: false,
    },
  },
};
