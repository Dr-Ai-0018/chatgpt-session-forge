# Session Forge

**[中文](#中文) · [English](#english)**

![offline](https://img.shields.io/badge/offline-100%25-f5a623)
![backend](https://img.shields.io/badge/backend-none-46c8b0)
![csp](https://img.shields.io/badge/connect--src-'none'-e5544e)
![react](https://img.shields.io/badge/React-18-57b6ff)
![typescript](https://img.shields.io/badge/TypeScript-strict-3178c6)
![vite](https://img.shields.io/badge/Vite-6-646cff)

> 把一段 **ChatGPT 网页会话凭据** 锻造成 7 种下游工具能直接吃的格式。
> A browser-only tool that forges one **ChatGPT web session** into 7 downstream auth formats.
> **无后端 · 无联网 · 零落盘 — No backend · no network · zero disk writes.**

---

## 中文

**Session Forge** 把浏览器里拿到的 ChatGPT 会话 JSON,一键转换成下面 7 种工具能直接导入的凭据格式:

**Codex `auth.json` · Sub2API · CPA(CLIProxyAPI)· Cockpit · 9Router · AxonHub · Codex-Manager**

所有解析、转换、脱敏都在你的浏览器里完成。凭据(`access_token` / `session_token`)等同登录密码,**本工具永不上传、不落盘、不缓存** —— 这正是它存在的意义。

### 隐私模型(核心价值)

- **没有后端,没有网络请求。** 生产构建注入了严格的 `Content-Security-Policy`(`connect-src 'none'`),页面在物理层面就发不出任何请求 —— 你可以断网使用,或在浏览器 Network 面板亲自验证。
- 输入不写入 `localStorage`、Cookie 或 URL;刷新即清空。
- "跳过"面板里的预览会对 token 字段自动打码,不显示完整密钥。

### 支持的目标格式

| 目标 | 真实上游 | 导入去处 |
| --- | --- | --- |
| **Sub2API** | 开源中转 / 号池服务 | 后台账号管理 → 批量导入 JSON |
| **CPA** | CLIProxyAPI | 认证文件目录 / 桌面端导入 |
| **Cockpit** | Cockpit Tools 桌面版 | 账号管理 → Token/JSON 导入 |
| **9Router** | 免费 AI 编码路由 | 面板 Providers 导入(或 OAuth 登录) |
| **Codex** | 官方 Codex CLI | `~/.codex/auth.json`(Win: `%USERPROFILE%\.codex\`) |
| **AxonHub** | 多协议认证中枢 | 后台 Accounts → Import |
| **Codex-Manager** | 本地号池 + 网关 | 启动服务 → 账号管理 → 批量导入 |

> 每种格式的字段结构、导入步骤与注意事项,都在应用内的 **「配置教程」弹窗**(右上角 `? 教程`)里有详解 —— 标签页分渠道、markdown 渲染、语法高亮。

### 快速上手

1. 登录 <https://chatgpt.com>,同一浏览器访问 `https://chatgpt.com/api/auth/session`,复制返回的 JSON。
2. 粘贴进左侧输入框(或拖入 `.json` 文件,支持多文件 / 数组批量)。
3. 选好顶部的目标格式,点 **锻造 ⟡**(或 `Ctrl / ⌘ + Enter`)。
4. 右侧查看账号、点开单条看 JWT 详情;底部复制 / 下载结果。

> ⚠️ 网页会话 token 通常**不带 `refresh_token`**,过期(几小时到几天)后无法自动续期,需重新导出。详见应用内教程。

### 本地开发

```bash
npm install
npm run dev        # 开发服务器(HMR;dev 下放宽 CSP)
npm test           # vitest(22 个测试)
npm run typecheck  # tsc -b
npm run build      # -> dist/(注入严格 CSP)
npm run preview    # 预览构建产物
```

### 免责声明

本项目是独立开源工具,**与 OpenAI 无任何关联**。转换、共享或轮换账号凭据可能违反 OpenAI 服务条款,由使用者自行承担责任。请仅在你**拥有或获授权**的账号上使用。

---

## English

**Session Forge** converts a ChatGPT web-session JSON — grabbed from your own browser — into credentials ready to import into 7 downstream tools:

**Codex `auth.json` · Sub2API · CPA (CLIProxyAPI) · Cockpit · 9Router · AxonHub · Codex-Manager**

Every parse, conversion, and redaction happens in your browser. The credentials (`access_token` / `session_token`) are as sensitive as a password — this tool **never uploads, persists, or caches them**. That guarantee is the whole point.

### Privacy model (the core value)

- **No backend, no network access.** The production build injects a strict `Content-Security-Policy` (`connect-src 'none'`), so the page physically cannot make a request. Use it offline, or verify it yourself in the browser's Network panel.
- Input is never written to `localStorage`, cookies, or the URL; a refresh clears everything.
- Previews in the "skipped" panel mask token fields — full secrets are never shown.

### Supported targets

| Target | Upstream project | Where it imports |
| --- | --- | --- |
| **Sub2API** | Open-source relay / account pool | Admin → accounts → batch import JSON |
| **CPA** | CLIProxyAPI | Auth-files directory / desktop import |
| **Cockpit** | Cockpit Tools (desktop) | Account manager → Token/JSON import |
| **9Router** | Free AI coding router | Dashboard → Providers (or OAuth login) |
| **Codex** | Official Codex CLI | `~/.codex/auth.json` (Win: `%USERPROFILE%\.codex\`) |
| **AxonHub** | Multi-protocol auth hub | Dashboard → Accounts → Import |
| **Codex-Manager** | Local pool + gateway | Start service → accounts → batch import |

> Field shapes, import steps, and gotchas for every format are documented in the in-app **Setup Guide** (top-right `? GUIDE`) — per-channel tabs, rendered markdown, syntax highlighting.

### Quick start

1. Sign in at <https://chatgpt.com>, then in the same browser open `https://chatgpt.com/api/auth/session` and copy the JSON.
2. Paste it into the input pane (or drop `.json` files — multi-file / array batches work).
3. Pick a target at the top and hit **FORGE ⟡** (or `Ctrl / ⌘ + Enter`).
4. Inspect accounts on the right, open one for JWT details; copy / download the result from the bottom.

> ⚠️ Web-session tokens usually carry **no `refresh_token`**, so they can't auto-renew after expiry (hours to days) — just re-export. See the in-app guide.

### Develop

```bash
npm install
npm run dev        # dev server (HMR; CSP relaxed in dev)
npm test           # vitest (22 tests)
npm run typecheck  # tsc -b
npm run build      # -> dist/ (strict CSP injected)
npm run preview    # serve the built dist/
```

### Architecture

```
src/
  core/          framework-agnostic conversion library (no React, no DOM)
    extract.ts   walk arbitrary JSON, normalize accounts, dedupe, decode JWTs
    converters.ts the 7 output formats
    jwt.ts       decode payloads + mint a synthetic id_token when one is missing
    expiry.ts    normalize + status expiry across ISO / epoch s|ms
    redact.ts    secret-safe previews for the skipped panel
    utils / constants / types
    __tests__/   deterministic snapshot tests (clock frozen)
  components/    React UI — Header, FormatBar, Input/Output panes, accounts
                 rail + list, mobile body + drawer, detail/output/guide modals,
                 Markdown renderer, toast host, confirm dialog
  content/       in-app Setup Guide: section-marked markdown (single source)
  store.ts       app state (paste + files, forge, accent)
  ui-store.ts    themed toasts, confirm dialog, modal + mobile layout state
  lib/           i18n (zh/en), clipboard/download, ui helpers, useMediaQuery
```

The `core/` folder is a pure library — reusable from a CLI, a worker, or tests.

### Stack

- **Vite 6 + React 18 + TypeScript** (strict) — static SPA, no server
- **Tailwind CSS v4** — amber "air-gapped instrument" theme (tokens in `src/index.css`)
- **Zustand** — app + UI state
- **react-markdown + remark-gfm + rehype-highlight** — the in-app guide (lazy-loaded, code-split)
- **Vitest** — 22 tests (core snapshots + guide parsing + markdown rendering)

### Disclaimer

This is an independent open-source tool and is **not affiliated with OpenAI**. Converting, sharing, or rotating account credentials may violate OpenAI's Terms of Service; you are responsible for how you use it. Only use it with accounts you **own or are authorized to manage**.
