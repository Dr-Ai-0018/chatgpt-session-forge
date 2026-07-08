<!--
  Session Forge setup guide — English content source (single source of truth).
  One tab per <!--SECTION ...--> block, parsed by guide.ts.
  label must be space-free; group is guide | channel. ids match guide.zh.md.
-->

<!--SECTION id=start label=Start group=guide-->

# Get your session JSON in 3 steps

This tool forges a **ChatGPT web-session credential** into 7 downstream formats. Everything runs **100% locally in your browser** — credentials are never uploaded, written to disk, or cached.

> ⚠️ `access_token` / `session_token` are **as sensitive as your password**. Never screenshot them, paste them into public repos or chats, or send them to any online service. This tool has no backend and works offline — that's the whole point.

### Steps

1. Sign in at <https://chatgpt.com> and make sure you're logged in.
2. In the **same browser**, open a new tab and visit the session endpoint:

```text
https://chatgpt.com/api/auth/session
```

3. The page returns a JSON blob (fields vary by account type):

```json
{
  "user": { "email": "you@example.com", "name": "You", "id": "user-..." },
  "accessToken": "eyJhbGciOi...a very long string...",
  "expires": "2026-08-01T00:00:00.000Z",
  "account": { "id": "acct-...", "planType": "plus" }
}
```

4. **Select-all, copy** the whole JSON and paste it into the input pane on the left — or drag the exported `.json` file straight in.
5. Pick a **target format** at the top and hit **FORGE ⟡** (or `Ctrl / ⌘ + Enter`).

### About `refresh_token` (read this first)

A ChatGPT web session's `access_token` **usually has no `refresh_token`**, which means:

- the token expires at `expires` (often hours to days) and **cannot auto-renew**;
- once expired, you have to redo step 1 and export again.

For targets that need a `refresh_token` (Codex / AxonHub), this tool writes a placeholder and shows a note — the importer can still use the `access_token` until it expires. If your source already carries a `refresh_token` (e.g. exported from an OAuth login), it's preserved verbatim and can auto-renew long-term.

> 💡 **Batch**: put several accounts in one array `[ {…}, {…} ]`, or drop multiple files — the tool dedupes, extracts each one, and skips any without a token.
> 💡 **Round-trip**: files already in 9Router / Codex `auth.json` / AxonHub / Codex-Manager shape can also be used as input and re-converted to another format.

<!--SECTION id=sub2api label=Sub2API group=channel-->

# Sub2API

> An open-source relay / account-pool service ([`Wei-Shaw/sub2api`](https://github.com/Wei-Shaw/sub2api)) that unifies Claude / OpenAI / Gemini / Grok subscriptions into one API, with carpool sharing and cost-splitting, usable seamlessly by native tools. Usually deployed via Docker Compose / script / source; the admin dashboard defaults to `http://<server-ip>:8080`.

### Output shape

A full document; each entry in `accounts[]` carries `credentials` + `extra`:

```json
{
  "exported_at": "2026-07-07T00:00:00.000Z",
  "proxies": [],
  "accounts": [
    {
      "name": "you@example.com",
      "platform": "openai",
      "type": "oauth",
      "expires_at": 1785000000,
      "auto_pause_on_expired": true,
      "concurrency": 10,
      "priority": 1,
      "credentials": {
        "access_token": "...",
        "email": "you@example.com",
        "plan_type": "plus",
        "expires_in": 3600
      },
      "extra": { "email": "you@example.com", "name": "You", "source": "..." }
    }
  ]
}
```

### Import steps

1. Sign in to the Sub2API admin dashboard.
2. Go to **Accounts / Upstream**.
3. Use **Batch import / Import JSON** and paste or upload this `accounts[]` document.
4. After saving, the OpenAI OAuth accounts are selectable in your channels.

### Notes

- `expires_at` is a Unix timestamp.
- `auto_pause_on_expired: true` auto-pauses the account once it expires, so you don't burn requests.

<!--SECTION id=cpa label=CPA group=channel-->

# CPA · CLIProxyAPI

> CLIProxyAPI ([`router-for-me/CLIProxyAPI`](https://github.com/router-for-me/CLIProxyAPI), a.k.a. **CPA**) wraps ChatGPT Codex / Claude Code / Grok / Antigravity as an OpenAI / Gemini / Claude / Codex-compatible API. There's also a Tauri desktop client for managing multiple auth files, checking quota, and testing token health.

### Output shape

A single account (an array for multiple):

```json
{
  "type": "codex",
  "account_id": "acct-...",
  "email": "you@example.com",
  "plan_type": "plus",
  "id_token": "eyJ...",
  "access_token": "eyJ...",
  "refresh_token": "",
  "session_token": "...",
  "last_refresh": "2026-07-07T00:00:00.000Z",
  "expired": "2026-08-01T00:00:00.000Z"
}
```

### Import steps

1. Find CPA's **auth-files directory**, or the "import auth file" entry in the desktop client.
2. Import / save this JSON as an account entry in CPA's config.
3. Select the account in CPA to expose a compatible API.

### Notes

- When `id_token` is missing, this tool synthesizes a placeholder JWT (`id_token_synthetic`) for compatibility.
- An empty `refresh_token` string means the token can't be renewed.

<!--SECTION id=cockpit label=Cockpit group=channel-->

# Cockpit Tools

> A desktop app ([`jlcodes99/cockpit-tools`](https://github.com/jlcodes99/cockpit-tools)) that manages AI-IDE accounts across Codex / GitHub Copilot / Cursor / Windsurf / Kiro / Gemini-CLI: multi-account switching, quota monitoring, multi-instance. Ships as macOS `.dmg` / Windows `.msi`·`.exe` / Linux `.deb`·`.rpm`.

### Output shape

One flat token record per account:

```json
{
  "type": "codex",
  "id_token": "eyJ...",
  "access_token": "eyJ...",
  "refresh_token": "",
  "account_id": "acct-...",
  "last_refresh": "2026-07-07T00:00:00.000Z",
  "email": "you@example.com",
  "expired": "2026-08-01T00:00:00.000Z"
}
```

### Import steps

1. Install and open Cockpit Tools.
   - On macOS, if it says "damaged": `sudo xattr -rd com.apple.quarantine "/Applications/Cockpit Tools.app"`
2. Go to **account management** and choose **Token / JSON import** (the other option is OAuth authorization).
3. Paste / upload this flat JSON and save.

### Notes

- This is a per-account flat record; for batches, import one at a time or as an array if the UI supports it.

<!--SECTION id=9router label=9Router group=channel-->

# 9Router

> A free AI coding router ([`decolua/9router`](https://github.com/decolua/9router)) that connects Claude Code / Codex / Cursor / Cline / Copilot to 40+ upstreams with auto-fallback and token saving. You can connect Codex either via **OAuth login (local port 1455)** in the dashboard, or by importing a provider-account JSON directly.

### Output shape

camelCase fields with a nested `providerSpecificData`:

```json
{
  "accessToken": "eyJ...",
  "refreshToken": "...",
  "expiresAt": "2026-08-01T00:00:00.000Z",
  "expiresIn": 3600,
  "testStatus": "active",
  "provider": "codex",
  "authType": "oauth",
  "email": "you@example.com",
  "providerSpecificData": {
    "chatgptAccountId": "acct-...",
    "chatgptPlanType": "plus"
  },
  "isActive": true
}
```

### Import steps

1. Open the 9Router dashboard → **Providers / account management**.
2. Import this provider-account JSON (`provider` is `codex`).
3. Once saved, it joins routing and fallback.

### Notes

- 9Router has known token-refresh persistence issues with Codex OAuth: **accounts without a `refresh_token` may report "Token invalid or revoked" after a few days** — just re-import when that happens.

<!--SECTION id=codex label=Codex group=channel-->

# Codex · native auth.json

> OpenAI's official **Codex CLI** login-cache file. Once placed correctly, `codex` reads it on startup — no browser login needed.

### File location

- macOS / Linux: `~/.codex/auth.json`
- Windows: `%USERPROFILE%\.codex\auth.json`
- The directory can be changed with the `CODEX_HOME` env var; credential storage is controlled by `cli_auth_credentials_store` (`file` = auth.json, `keyring` = OS keychain).

### Output shape

```json
{
  "auth_mode": "chatgpt",
  "OPENAI_API_KEY": null,
  "tokens": {
    "id_token": "eyJ...",
    "access_token": "eyJ...",
    "refresh_token": "",
    "account_id": "acct-..."
  },
  "last_refresh": "2026-07-07T00:00:00.000Z"
}
```

### Import steps

1. Save this JSON as `auth.json`.
2. Put it at the path for your OS above (create the `.codex` folder if it doesn't exist).
3. Run `codex` — it reuses the credential.

### Notes

- OpenAI is explicit: **treat `auth.json` like a password** — don't commit it or paste it into tickets / chats.
- If `refresh_token` is empty, Codex can't auto-renew; re-import once the `access_token` expires.
- Headless / CI: run `codex login` on a machine with a browser, then copy `auth.json` to the target machine at the same path.

<!--SECTION id=axonhub label=AxonHub group=channel-->

# AxonHub

> A multi-protocol auth hub that centralizes upstream accounts in its web admin. It ingests the same `auth_mode: "chatgpt"` + `tokens` shape as Codex `auth.json`.

### Output shape

```json
{
  "auth_mode": "chatgpt",
  "last_refresh": "2026-07-31T23:00:00.000Z",
  "tokens": {
    "access_token": "eyJ...",
    "refresh_token": "__missing_refresh_token__",
    "id_token": "eyJ..."
  },
  "axonhub_refresh_token_placeholder": true,
  "axonhub_note": "refresh_token is a placeholder; access_token works only until it expires."
}
```

### Import steps

1. Sign in to the AxonHub admin → **Accounts → Import**.
2. Paste / upload this JSON.
3. After saving, the account joins the pool.

### Notes

- When the source has no `refresh_token`, this tool writes `__missing_refresh_token__` plus an `axonhub_note`; the account works only until the `access_token` expires.

<!--SECTION id=codex-manager label=Codex-Manager group=channel-->

# Codex-Manager

> A local desktop app + service process ([`qxcnm/Codex-Manager`](https://github.com/qxcnm/Codex-Manager)) that pools multiple Codex CLI accounts and offers **local gateway forwarding**, with account management and quota stats.

### Database location

- Windows: `%APPDATA%\com.codexmanager.desktop\codexmanager.db`
- macOS: `~/Library/Application Support/com.codexmanager.desktop/codexmanager.db`
- Linux: `~/.local/share/com.codexmanager.desktop/codexmanager.db`

### Output shape

Two blocks — `tokens` + `meta`:

```json
{
  "tokens": {
    "access_token": "eyJ...",
    "refresh_token": "",
    "id_token": "eyJ...",
    "account_id": "acct-...",
    "chatgpt_account_id": "acct-..."
  },
  "meta": {
    "label": "you@example.com",
    "workspace_id": "...",
    "chatgpt_account_id": "acct-...",
    "note": "Imported from ChatGPT session"
  }
}
```

### Import steps

1. Open the Codex-Manager desktop app → click **Start service**.
2. Go to **account management → add account**.
3. Choose **Batch import / Import JSON**: paste this JSON, upload a file; the desktop version also supports recursive folder import.
4. Once imported, the local gateway forwards across the pool.

### Notes

- Supports batch and recursive-folder import — handy for loading a whole account pool at once.

<!--SECTION id=notes label=Notes group=guide-->

# General notes · Glossary · FAQ

### General notes

- **Expiry & renewal**: most web-session tokens have no `refresh_token`, so they die on expiry — re-export from "Start". Check each tool's quota / health panel regularly.
- **Pool / carpool risk**: frequent multi-account rotation or cross-region reuse can trip anomaly detection. Keep concurrency modest and spread usage out.
- **Credential safety**: processing is fully local, but the output file is still a sensitive credential — store it in an encrypted location, clean it up after use, and keep it out of version control.
- **Round-trip conversion**: 9Router / Codex / AxonHub / Codex-Manager formats can be fed back in as input and converted to another format, easing migration between systems.

### Glossary

| Field | Meaning |
| --- | --- |
| `access_token` | Access token — the core API credential, **as sensitive as a password**, time-limited. |
| `id_token` | Identity token (JWT) carrying email / account_id / plan claims; synthesized as a placeholder when missing. |
| `refresh_token` | Refresh token for auto-renewal; web sessions usually lack it. |
| `session_token` | The web-session cookie (`__Secure-next-auth.session-token`), needed by some tools. |
| `account_id` | The ChatGPT workspace / account ID, parsed from JWT claims. |
| `expires` / `expires_at` / `expired` | Expiry time; targets use ISO strings or Unix timestamps. |
| `auth_mode` | Auth mode; `chatgpt` means use the ChatGPT subscription rather than an official API key. |
| `plan_type` | Subscription tier: `free` / `plus` / `pro` / `team` / `enterprise`. |

### FAQ

**Q: It says "Token invalid / revoked" soon after importing.**
A: Most likely there's no `refresh_token` and the `access_token` has expired. Re-export from "Start" and import again.

**Q: `/api/auth/session` returns empty `{}` or an error.**
A: The browser isn't logged in to ChatGPT, or you hit rate limiting. Sign in at chatgpt.com, refresh, then open the endpoint again.

**Q: Can one file hold multiple accounts?**
A: Yes. Use an array `[ {…}, {…} ]` for input, or drop multiple files; the tool dedupes and extracts each, skipping any without a token.

**Q: Will my tokens be sent to your servers?**
A: No. This is a pure static page — no backend, no network requests, works offline. Verify it yourself in the browser DevTools Network panel: forging makes no outbound request.

### Sources / references

- Reference prototype: [gtxx3600/GPTSession2CPAandSub2API](https://github.com/gtxx3600/GPTSession2CPAandSub2API)
- Sub2API: [Wei-Shaw/sub2api](https://github.com/Wei-Shaw/sub2api) · CPA: [router-for-me/CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI)
- Cockpit: [jlcodes99/cockpit-tools](https://github.com/jlcodes99/cockpit-tools) · 9Router: [decolua/9router](https://github.com/decolua/9router)
- Codex-Manager: [qxcnm/Codex-Manager](https://github.com/qxcnm/Codex-Manager) · Codex auth docs: [developers.openai.com/codex/auth](https://developers.openai.com/codex/auth)
