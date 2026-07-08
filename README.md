# Session Forge

Offline, browser-only converter for ChatGPT web-session credentials. Paste a
session JSON (or drop files), and export it into any of 7 downstream formats:
**Sub2API · CPA · Cockpit · 9Router · Codex · AxonHub · Codex-Manager**.

> ⚠️ The session JSON holds `accessToken` / `sessionToken` — treat it like a
> password. This tool never sends it anywhere.

## Privacy model

Everything runs in the browser. There is **no backend and no network access**:
the production build ships a strict `Content-Security-Policy` with
`connect-src 'none'`, so the page physically cannot make a request. Input is not
persisted to `localStorage`, cookies, or the URL.

## Design

An "air-gapped instrument" TUI aesthetic (amber / green / ice accent, switchable):
monospace throughout, terminal panel chrome, corner brackets, three-zone layout
(input · accounts · inspector) over a bottom output console. Every browser
default is overridden — custom scrollbars, focus rings, caret, selection, plus a
themed toast system and confirm dialog (no native `alert`/`confirm`), and ambient
"breathing" micro-motion. The visual language came from a Claude Design project;
the conversion engine underneath is the tested `src/core`.

## Stack

- **Vite + React + TypeScript** — static SPA, no server
- **Tailwind CSS v4** — amber instrument theme (tokens in `src/index.css`)
- **Zustand** — app state (`store.ts`) + UI/toasts/confirm (`ui-store.ts`)
- **Vitest** — snapshot tests for the conversion core

## Architecture

```
src/
  core/          framework-agnostic conversion library (no React, no DOM)
    extract.ts   walk arbitrary JSON, normalize accounts, decode JWTs
    converters.ts the 7 output formats
    ...          jwt / expiry / redact / utils / constants / types
    __tests__/   deterministic snapshot tests (clock is frozen)
  components/    React UI (Header, InputColumn, AccountsColumn, InspectorColumn,
                 BottomConsole, ToastHost, ConfirmDialog)
  store.ts       app state (paste + files, forge, accent)
  ui-store.ts    themed toasts + confirm dialog
  lib/           i18n (zh/en) + clipboard/download + ui helpers
```

The `core/` folder is a pure library — reusable from a CLI, worker, or tests.

## Develop

```bash
npm install
npm run dev        # dev server (HMR; CSP relaxed in dev)
npm test           # vitest
npm run typecheck  # tsc -b
npm run build      # -> dist/ (strict CSP injected)
npm run preview    # serve the built dist/
```

## Features

- Recursive extraction with field-alias matching + JWT payload decoding
- Multi-file batch import (paste / picker / drag-drop) with dedup
- Account table with live expiry status (valid / expiring / expired)
- Per-account inspector: decoded JWT header + payload + signature, and the
  single-record output in the current format
- One-click copy / download, switchable accent, 中文 / English toggle
- Skipped-entry panel with secret-safe previews
