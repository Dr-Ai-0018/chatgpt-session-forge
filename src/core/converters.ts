import { calculateExpiresIn, normalizeExpiry, oneHourBefore } from "./expiry";
import type { JsonValue, NormalizedAccount, TargetId } from "./types";
import {
  cleanOriginalObject,
  createEmailKey,
  firstString,
  getByPath,
  omitNullishObject,
} from "./utils";

function createSub2ApiAccount(account: NormalizedAccount, nowMs: number): JsonValue {
  return cleanOriginalObject({
    name: firstString([account.name, account.email, account.source, "ChatGPT Account"]),
    platform: "openai",
    type: "oauth",
    expires_at: account.accessTokenExpiresAt,
    auto_pause_on_expired: true,
    concurrency: 10,
    priority: 1,
    credentials: {
      access_token: account.accessToken,
      chatgpt_account_id: account.chatgptAccountId,
      chatgpt_user_id: account.chatgptUserId,
      email: account.email,
      expires_at: account.expiresAt,
      expires_in: calculateExpiresIn(account.expiresAt, nowMs),
      plan_type: account.planType,
    },
    extra: {
      email: account.email,
      email_key: createEmailKey(account.email),
      name: account.name,
      auth_provider: account.authProvider,
      source: account.outputSource,
      last_refresh: account.lastRefresh,
    },
  }) as JsonValue;
}

function createCpaAccount(account: NormalizedAccount): JsonValue {
  return omitNullishObject({
    type: "codex",
    account_id: account.chatgptAccountId,
    chatgpt_account_id: account.chatgptAccountId,
    email: account.email,
    name: account.name,
    plan_type: account.planType,
    chatgpt_plan_type: account.planType,
    id_token: account.effectiveIdToken,
    id_token_synthetic: account.idTokenSynthetic || undefined,
    access_token: account.accessToken,
    refresh_token: account.refreshToken || "",
    session_token: account.sessionToken,
    last_refresh: account.lastRefresh,
    expired: account.expiresAt,
    disabled: account.disabled || undefined,
  }) as JsonValue;
}

function createCockpitAccount(account: NormalizedAccount): JsonValue {
  return omitNullishObject({
    type: "codex",
    id_token: account.effectiveIdToken,
    access_token: account.accessToken,
    refresh_token: account.refreshToken || "",
    account_id: account.chatgptAccountId,
    last_refresh: account.lastRefresh,
    email: account.email,
    expired: account.expiresAt,
    account_note: account.accountNote,
  }) as JsonValue;
}

function createNineRouterAccount(account: NormalizedAccount, nowMs: number): JsonValue {
  return cleanOriginalObject({
    accessToken: account.accessToken,
    refreshToken: account.refreshToken,
    expiresAt: account.expiresAt,
    testStatus: firstString([
      getByPath(account.raw, "testStatus"),
      getByPath(account.raw, "test_status"),
      "active",
    ]),
    expiresIn: calculateExpiresIn(account.expiresAt, nowMs),
    providerSpecificData: {
      chatgptAccountId: account.chatgptAccountId,
      chatgptPlanType: account.planType,
    },
    id: account.chatgptAccountId,
    provider: "codex",
    authType: "oauth",
    name: account.name,
    email: account.email,
    priority: account.priority,
    isActive: account.isActive,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  }) as JsonValue;
}

function createCodexAuthJson(account: NormalizedAccount): JsonValue {
  return {
    auth_mode: "chatgpt",
    OPENAI_API_KEY: null,
    tokens: omitNullishObject({
      id_token: account.effectiveIdToken,
      access_token: account.accessToken,
      refresh_token: account.refreshToken || "",
      account_id: account.chatgptAccountId,
    }) as JsonValue,
    last_refresh: account.lastRefresh,
  };
}

function createAxonHubAuth(account: NormalizedAccount): JsonValue {
  return cleanOriginalObject({
    auth_mode: "chatgpt",
    last_refresh: oneHourBefore(account.expiresAt) || account.lastRefresh,
    tokens: {
      access_token: account.accessToken,
      refresh_token: account.refreshToken || "__missing_refresh_token__",
      id_token: account.effectiveIdToken,
    },
    axonhub_refresh_token_placeholder: account.refreshToken ? undefined : true,
    axonhub_note: account.refreshToken
      ? undefined
      : "refresh_token is a placeholder; access_token works only until it expires.",
  }) as JsonValue;
}

function createCodexManagerAuth(account: NormalizedAccount): JsonValue {
  return {
    tokens: omitNullishObject({
      access_token: account.accessToken,
      refresh_token: account.refreshToken || "",
      id_token: account.idToken || "",
      account_id: account.chatgptAccountId,
      chatgpt_account_id: account.codexManagerAccountId,
    }) as JsonValue,
    meta: cleanOriginalObject({
      label: firstString([account.name, account.email, account.source, "ChatGPT Account"]),
      workspace_id: account.workspaceId,
      chatgpt_account_id: account.codexManagerAccountId,
      note: "Imported from ChatGPT session",
    }) as JsonValue,
  };
}

/** Single-account preview for a given target (used by the per-row output view). */
export function convertOne(
  account: NormalizedAccount,
  target: TargetId,
  nowMs: number = Date.now(),
): JsonValue {
  switch (target) {
    case "sub2api":
      return createSub2ApiAccount(account, nowMs);
    case "cpa":
      return createCpaAccount(account);
    case "cockpit":
      return createCockpitAccount(account);
    case "9router":
      return createNineRouterAccount(account, nowMs);
    case "codex":
      return createCodexAuthJson(account);
    case "axonhub":
      return createAxonHubAuth(account);
    case "codex-manager":
      return createCodexManagerAuth(account);
    default:
      return createSub2ApiAccount(account, nowMs);
  }
}

/** Full document for a target from a list of accounts. */
export function convertAccounts(
  accounts: NormalizedAccount[],
  target: TargetId,
  nowMs: number = Date.now(),
): JsonValue {
  if (target === "sub2api") {
    return {
      exported_at: normalizeExpiry(new Date(nowMs)),
      proxies: [],
      accounts: accounts.map((account) => createSub2ApiAccount(account, nowMs)),
    };
  }

  const output = accounts.map((account) => convertOne(account, target, nowMs));
  return accounts.length === 1 ? output[0] : output;
}
