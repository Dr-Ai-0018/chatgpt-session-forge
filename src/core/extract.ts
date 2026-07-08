import {
  ACCOUNT_CONTAINER_KEYS,
  FIELD_PATHS,
  TOKEN_CONTAINER_KEYS,
} from "./constants";
import { normalizeExpiry } from "./expiry";
import {
  createSyntheticIdToken,
  decodeJwtPayload,
  getOpenAiAuth,
  getOpenAiProfile,
} from "./jwt";
import { createSafePreview, maskSecret } from "./redact";
import type { NormalizedAccount, ParseResult, SkippedItem, Source } from "./types";
import {
  appendPath,
  firstString,
  getByPath,
  hashString,
  isPlainObject,
  pickFirstString,
  slugify,
  stripBom,
  toPositiveInteger,
} from "./utils";

interface JsonOk {
  ok: true;
  data: unknown;
}
interface JsonErr {
  ok: false;
  error: string;
}

export function parseJsonInput(text: string): JsonOk | JsonErr {
  const value = stripBom(text).trim();
  if (!value) {
    return { ok: false, error: "输入为空" };
  }
  try {
    return { ok: true, data: JSON.parse(value) };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: `JSON 解析失败：${message}。请确认输入是纯 JSON。` };
  }
}

function hasToken(value: unknown): boolean {
  return Boolean(
    pickFirstString(value, FIELD_PATHS.accessToken) ||
      pickFirstString(value, FIELD_PATHS.sessionToken) ||
      pickFirstString(value, FIELD_PATHS.refreshToken),
  );
}

function hasIdentity(value: unknown): boolean {
  return Boolean(
    pickFirstString(value, FIELD_PATHS.email) ||
      pickFirstString(value, FIELD_PATHS.name) ||
      pickFirstString(value, FIELD_PATHS.accountId),
  );
}

function createStableId(seed: string | null, token: string | null): string {
  const readable = slugify(seed || "account");
  return `${readable}-${hashString(token || seed || "account").slice(0, 8)}`;
}

function createAccountSignature(account: NormalizedAccount): string {
  return [
    account.email || "",
    account.accessToken || "",
    account.sessionToken || "",
    account.refreshToken || "",
  ].join("|");
}

interface NormalizeContext {
  source: string;
  path: string;
  nowMs: number;
}

interface NormalizeResult {
  account?: NormalizedAccount;
  error?: string;
}

function normalizeAccount(value: unknown, context: NormalizeContext): NormalizeResult {
  if (!isPlainObject(value)) {
    return { error: "Session is not a JSON object" };
  }

  const accessToken = pickFirstString(value, [
    "accessToken",
    "access_token",
    "tokens.accessToken",
    "tokens.access_token",
    "token.accessToken",
    "token.access_token",
    "credentials.accessToken",
    "credentials.access_token",
  ]);
  if (!accessToken) {
    return { error: "Missing accessToken" };
  }

  const sessionToken = pickFirstString(value, [
    "sessionToken",
    "session_token",
    "tokens.sessionToken",
    "tokens.session_token",
    "token.sessionToken",
    "token.session_token",
    "credentials.sessionToken",
    "credentials.session_token",
  ]);
  const refreshToken = pickFirstString(value, [
    "refreshToken",
    "refresh_token",
    "tokens.refreshToken",
    "tokens.refresh_token",
    "token.refreshToken",
    "token.refresh_token",
    "credentials.refreshToken",
    "credentials.refresh_token",
  ]);
  const idToken = pickFirstString(value, [
    "idToken",
    "id_token",
    "tokens.idToken",
    "tokens.id_token",
    "token.idToken",
    "token.id_token",
    "credentials.idToken",
    "credentials.id_token",
  ]);

  const accessPayload = decodeJwtPayload(accessToken);
  const idPayload = decodeJwtPayload(idToken);
  const accessAuth = getOpenAiAuth(accessPayload);
  const idAuth = getOpenAiAuth(idPayload);
  const accessProfile = getOpenAiProfile(accessPayload);
  const accessTokenExpiresAt = toPositiveInteger(accessPayload && accessPayload.exp);
  const expiresAt = firstString([
    accessTokenExpiresAt ? normalizeExpiry(accessTokenExpiresAt) : null,
    normalizeExpiry(getByPath(value, "expires")),
    normalizeExpiry(getByPath(value, "expiresAt")),
    normalizeExpiry(getByPath(value, "expired")),
    normalizeExpiry(getByPath(value, "expires_at")),
  ]);
  const email = firstString([
    getByPath(value, "user.email"),
    getByPath(value, "email"),
    getByPath(value, "account.email"),
    getByPath(value, "profile.email"),
    getByPath(value, "identity.email"),
    getByPath(value, "meta.label"),
    getByPath(value, "label"),
    getByPath(value, "credentials.email"),
    getByPath(value, "providerSpecificData.email"),
    accessProfile.email,
    idPayload && idPayload.email,
    accessPayload && accessPayload.email,
  ]);
  const chatgptAccountId = firstString([
    getByPath(value, "account.id"),
    getByPath(value, "account_id"),
    getByPath(value, "tokens.accountId"),
    getByPath(value, "tokens.account_id"),
    getByPath(value, "chatgptAccountId"),
    getByPath(value, "chatgpt_account_id"),
    getByPath(value, "meta.chatgptAccountId"),
    getByPath(value, "meta.chatgpt_account_id"),
    getByPath(value, "tokens.chatgptAccountId"),
    getByPath(value, "tokens.chatgpt_account_id"),
    getByPath(value, "providerSpecificData.chatgptAccountId"),
    getByPath(value, "providerSpecificData.chatgpt_account_id"),
    getByPath(value, "credentials.chatgpt_account_id"),
    accessAuth.chatgpt_account_id,
    idAuth.chatgpt_account_id,
    getByPath(value, "provider") === "codex" ? getByPath(value, "id") : null,
  ]);
  const codexManagerAccountId = firstString([
    getByPath(value, "chatgptAccountId"),
    getByPath(value, "chatgpt_account_id"),
    getByPath(value, "meta.chatgptAccountId"),
    getByPath(value, "meta.chatgpt_account_id"),
    getByPath(value, "tokens.chatgptAccountId"),
    getByPath(value, "tokens.chatgpt_account_id"),
    getByPath(value, "providerSpecificData.chatgptAccountId"),
    getByPath(value, "providerSpecificData.chatgpt_account_id"),
    getByPath(value, "credentials.chatgpt_account_id"),
    accessAuth.chatgpt_account_id,
    idAuth.chatgpt_account_id,
  ]);
  const workspaceId = firstString([
    getByPath(value, "account.workspaceId"),
    getByPath(value, "account.workspace_id"),
    getByPath(value, "workspaceId"),
    getByPath(value, "workspace_id"),
    getByPath(value, "meta.workspaceId"),
    getByPath(value, "meta.workspace_id"),
    getByPath(value, "providerSpecificData.workspaceId"),
    getByPath(value, "providerSpecificData.workspace_id"),
    getByPath(value, "credentials.workspace_id"),
    accessPayload && accessPayload.workspace_id,
    idPayload && idPayload.workspace_id,
  ]);
  const chatgptUserId = firstString([
    getByPath(value, "user.id"),
    getByPath(value, "user_id"),
    getByPath(value, "chatgptUserId"),
    getByPath(value, "providerSpecificData.chatgptUserId"),
    getByPath(value, "providerSpecificData.chatgpt_user_id"),
    accessAuth.chatgpt_user_id,
    accessAuth.user_id,
    idAuth.chatgpt_user_id,
    idAuth.user_id,
  ]);
  const planType = firstString([
    getByPath(value, "account.planType"),
    getByPath(value, "account.plan_type"),
    getByPath(value, "planType"),
    getByPath(value, "plan_type"),
    getByPath(value, "providerSpecificData.chatgptPlanType"),
    getByPath(value, "providerSpecificData.chatgpt_plan_type"),
    getByPath(value, "credentials.plan_type"),
    accessAuth.chatgpt_plan_type,
    idAuth.chatgpt_plan_type,
  ]);
  const lastRefresh = normalizeExpiry(new Date(context.nowMs));
  const outputSource =
    getByPath(value, "provider") === "codex" && getByPath(value, "authType") === "oauth"
      ? "9router"
      : "chatgpt_web_session";
  const name = firstString([
    getByPath(value, "user.name"),
    getByPath(value, "account.name"),
    getByPath(value, "profile.name"),
    getByPath(value, "name"),
    email,
    context.source,
    "ChatGPT Account",
  ]);
  const syntheticIdToken = idToken
    ? null
    : createSyntheticIdToken(
        email,
        chatgptAccountId,
        planType,
        chatgptUserId,
        expiresAt,
        Math.trunc(context.nowMs / 1000),
      );
  const effectiveIdToken = firstString([idToken, syntheticIdToken]);
  const accountId =
    chatgptAccountId ||
    codexManagerAccountId ||
    firstString([accessPayload && (accessPayload.sub || accessPayload.user_id)]);
  const tokenForId =
    accessToken || sessionToken || refreshToken || email || accountId || context.path;
  const id = createStableId(email || accountId || context.path, tokenForId);

  const priorityRaw = Number(getByPath(value, "priority"));
  const isActiveRaw = getByPath(value, "isActive");

  return {
    account: {
      id,
      source: context.source,
      path: context.path,
      sourceType: outputSource,
      outputSource,
      email,
      name,
      accessToken,
      sessionToken,
      refreshToken,
      idToken,
      effectiveIdToken,
      idTokenSynthetic: Boolean(syntheticIdToken),
      accountId,
      chatgptAccountId,
      codexManagerAccountId,
      workspaceId,
      chatgptUserId,
      planType,
      accessTokenExpiresAt,
      expiresAt,
      lastRefresh,
      disabled: Boolean(getByPath(value, "disabled")),
      priority: Number.isFinite(priorityRaw) ? priorityRaw : 9,
      isActive: typeof isActiveRaw === "boolean" ? isActiveRaw : !getByPath(value, "disabled"),
      createdAt: normalizeExpiry(getByPath(value, "createdAt")) || lastRefresh,
      updatedAt: normalizeExpiry(getByPath(value, "updatedAt")) || lastRefresh,
      accountNote: firstString([
        getByPath(value, "account_note"),
        getByPath(value, "accountInfo"),
        getByPath(value, "account_info"),
        getByPath(value, "note"),
        getByPath(value, "notes"),
        getByPath(value, "remark"),
      ]),
      authProvider: firstString([
        getByPath(value, "authProvider"),
        getByPath(value, "auth_provider"),
      ]),
      raw: value,
    },
  };
}

interface Candidate {
  value: unknown;
  path: string;
}

function extractAccounts(
  data: unknown,
  sourceName: string,
  nowMs: number,
): { accounts: NormalizedAccount[]; skipped: SkippedItem[] } {
  const candidates: Candidate[] = [];
  const skipped: SkippedItem[] = [];
  const visited = new WeakSet<object>();

  walk(data, "$", 0, "root");

  if (!candidates.length && isPlainObject(data) && hasIdentity(data)) {
    skipped.push({
      path: `${sourceName}:$`,
      reason: "缺少 accessToken / sessionToken / refresh_token",
      valuePreview: createSafePreview(data),
    });
  }

  const accounts: NormalizedAccount[] = [];
  candidates.forEach((candidate) => {
    const normalized = normalizeAccount(candidate.value, {
      source: sourceName,
      path: `${sourceName}:${candidate.path}`,
      nowMs,
    });
    if (normalized.error) {
      skipped.push({
        path: `${sourceName}:${candidate.path}`,
        reason: normalized.error,
        valuePreview: createSafePreview(candidate.value),
      });
    } else if (normalized.account) {
      accounts.push(normalized.account);
    }
  });

  return { accounts, skipped };

  function walk(value: unknown, path: string, depth: number, parentKey: string): void {
    if (depth > 5 || value === null || typeof value !== "object") {
      return;
    }
    if (visited.has(value)) {
      return;
    }
    visited.add(value);

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (
          isPlainObject(item) &&
          ACCOUNT_CONTAINER_KEYS.has(parentKey) &&
          !hasToken(item) &&
          hasIdentity(item)
        ) {
          skipped.push({
            path: `${sourceName}:${path}[${index}]`,
            reason: "缺少 accessToken / sessionToken / refresh_token",
            valuePreview: createSafePreview(item),
          });
          return;
        }
        walk(item, `${path}[${index}]`, depth + 1, parentKey);
      });
      return;
    }

    if (!isPlainObject(value)) {
      return;
    }

    const accountLike = hasToken(value);
    if (accountLike) {
      candidates.push({ value, path });
    }

    Object.entries(value).forEach(([key, child]) => {
      if (child === null || typeof child !== "object") {
        return;
      }
      if (accountLike && TOKEN_CONTAINER_KEYS.has(key)) {
        return;
      }
      walk(child, appendPath(path, key), depth + 1, key);
    });
  }
}

/** Parse many sources, dedupe accounts by credential signature. */
export function parseSources(sources: Source[], nowMs: number = Date.now()): ParseResult {
  const aggregate: ParseResult = { accounts: [], skipped: [] };
  const seen = new Set<string>();

  sources.forEach((source) => {
    const parsed = parseJsonInput(source.text);
    if (!parsed.ok) {
      aggregate.skipped.push({ path: source.name, reason: parsed.error, valuePreview: "" });
      return;
    }

    const extracted = extractAccounts(parsed.data, source.name, nowMs);
    extracted.accounts.forEach((account) => {
      const key = createAccountSignature(account);
      if (seen.has(key)) {
        aggregate.skipped.push({
          path: account.path,
          reason: "重复账号，已忽略",
          valuePreview: `${account.email || "未知邮箱"} / ${maskSecret(
            account.accessToken || account.sessionToken || account.refreshToken,
          )}`,
        });
        return;
      }
      seen.add(key);
      aggregate.accounts.push(account);
    });
    aggregate.skipped.push(...extracted.skipped);
  });

  return aggregate;
}

export { hasToken, hasIdentity };
