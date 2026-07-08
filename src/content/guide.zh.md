<!--
  Session Forge 配置教程 — 应用内容源（单一真源）。
  每个标签页 = 一个 <!--SECTION ...--> 块，由 guide.ts 解析。
  label 不能含空格；group 为 guide | channel。
-->

<!--SECTION id=start label=开始 group=guide-->

# 三步拿到会话 JSON

把一段 **ChatGPT 网页会话凭据** 转换成 7 种下游工具能直接吃的格式。全程 **100% 在你浏览器本地完成** —— 凭据永不上传、不落盘、不缓存。

> ⚠️ `access_token` / `session_token` **等同你的登录密码**。不要截图外发、不要贴进公开仓库或群聊、不要传给任何在线网站。本工具没有后端,断网也能用 —— 这就是它存在的意义。

### 步骤

1. 用浏览器登录 <https://chatgpt.com>,确保处于已登录状态。
2. **同一浏览器**新开标签页,访问会话接口:

```text
https://chatgpt.com/api/auth/session
```

3. 页面返回一段 JSON(字段随账号类型增减):

```json
{
  "user": { "email": "you@example.com", "name": "You", "id": "user-..." },
  "accessToken": "eyJhbGciOi...很长的一串...",
  "expires": "2026-08-01T00:00:00.000Z",
  "account": { "id": "acct-...", "planType": "plus" }
}
```

4. **全选复制**整段 JSON,粘贴进左侧输入框;或把导出的 `.json` 文件直接拖进来。
5. 顶部选好 **目标格式**,点 **锻造 ⟡**(或按 `Ctrl / ⌘ + Enter`)。

### 关于 `refresh_token`（务必先看）

ChatGPT 网页会话里的 `access_token` **通常不带 `refresh_token`**,这意味着:

- token 会在 `expires` 时间点(往往几小时到几天)后失效,**无法自动续期**;
- 失效后需要回到步骤 1 重新导出一次。

对需要 `refresh_token` 的目标(Codex / AxonHub),本工具会写入占位符并给出提示,导入方仍可用到 `access_token` 过期为止。若你的来源本身带 `refresh_token`(如 OAuth 登录导出),则原样保留,可长期自动续期。

> 💡 **批量**:多个账号放进一个数组 `[ {…}, {…} ]`,或多文件一起拖入,工具自动去重、逐个抽取、缺 token 的自动跳过。
> 💡 **回炉**:已经是 9Router / Codex `auth.json` / AxonHub / Codex-Manager 格式的文件也能作为输入,再转成别的格式。

<!--SECTION id=sub2api label=Sub2API group=channel-->

# Sub2API

> 开源"中转 / 号池"服务([`Wei-Shaw/sub2api`](https://github.com/Wei-Shaw/sub2api)),把 Claude / OpenAI / Gemini / Grok 订阅统一成 API,支持拼车共享、成本分摊,原生工具无缝接入。通常用 Docker Compose / 脚本 / 源码部署,管理后台默认在 `http://<服务器IP>:8080`。

### 输出结构

整份文档,`accounts[]` 里每个账号带 `credentials` + `extra`:

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

### 导入步骤

1. 登录 Sub2API 管理后台。
2. 进入 **账号 / 上游管理**(Accounts / Upstream)。
3. 用 **批量导入 / Import JSON**,粘贴或上传这份 `accounts[]` 文档。
4. 保存后即可在渠道里选用这些 OpenAI OAuth 账号。

### 注意

- `expires_at` 为 Unix 时间戳。
- `auto_pause_on_expired: true` 会在过期后自动暂停该账号,避免打废请求。

<!--SECTION id=cpa label=CPA group=channel-->

# CPA · CLIProxyAPI

> CLIProxyAPI([`router-for-me/CLIProxyAPI`](https://github.com/router-for-me/CLIProxyAPI),社区简称 **CPA**),把 ChatGPT Codex / Claude Code / Grok / Antigravity 包装成 OpenAI / Gemini / Claude / Codex 兼容 API;也有 Tauri 桌面端,可管理多份认证文件、查额度、验 token 健康度。

### 输出结构

单账号(多账号则为数组):

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

### 导入步骤

1. 找到 CPA 的 **认证文件目录**(auth files),或桌面端"导入认证文件"入口。
2. 把这份 JSON 作为一个账号条目导入 / 保存进 CPA 的账号配置。
3. 在 CPA 里选中该账号,即可对外提供兼容 API。

### 注意

- 缺 `id_token` 时,本工具会合成一个占位 JWT(`id_token_synthetic`)以保证兼容。
- `refresh_token` 为空字符串表示无法续期。

<!--SECTION id=cockpit label=Cockpit group=channel-->

# Cockpit Tools

> 桌面应用([`jlcodes99/cockpit-tools`](https://github.com/jlcodes99/cockpit-tools)),统一管理 Codex / GitHub Copilot / Cursor / Windsurf / Kiro / Gemini-CLI 等 AI IDE 账号:多账号切换、配额监控、多开实例。提供 macOS `.dmg` / Windows `.msi`·`.exe` / Linux `.deb`·`.rpm`。

### 输出结构

每账号一条扁平 token:

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

### 导入步骤

1. 安装并打开 Cockpit Tools。
   - macOS 若提示"已损坏":`sudo xattr -rd com.apple.quarantine "/Applications/Cockpit Tools.app"`
2. 进入 **账号管理**,选 **Token / JSON 导入**(另一选项是 OAuth 授权)。
3. 粘贴 / 上传这份扁平 JSON,保存。

### 注意

- 这是"每账号一条"的扁平结构;批量时逐条导入,或按 UI 支持的数组形式导入。

<!--SECTION id=9router label=9Router group=channel-->

# 9Router

> 免费 AI 编码路由([`decolua/9router`](https://github.com/decolua/9router)),把 Claude Code / Codex / Cursor / Cline / Copilot 接到 40+ 上游,自动 fallback、省 token。既能通过 **OAuth 登录(本地端口 1455)** 在面板里连 Codex,也能直接导入 provider 账号 JSON。

### 输出结构

camelCase 字段 + `providerSpecificData` 嵌套:

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

### 导入步骤

1. 打开 9Router 控制面板 → **Providers / 账号管理**。
2. 用导入功能加入这份 provider 账号 JSON(`provider` 为 `codex`)。
3. 保存后即可在路由里参与调度与 fallback。

### 注意

- 9Router 对 Codex OAuth 有已知的续期持久化问题:**不带 `refresh_token` 的账号可能几天后报 "Token invalid or revoked"**,届时重新导入即可。

<!--SECTION id=codex label=Codex group=channel-->

# Codex · 原生 auth.json

> OpenAI 官方 **Codex CLI** 的登录缓存文件。放对位置后,`codex` 启动时直接读取,无需再走浏览器登录。

### 文件位置

- macOS / Linux:`~/.codex/auth.json`
- Windows:`%USERPROFILE%\.codex\auth.json`
- 可用环境变量 `CODEX_HOME` 改目录;凭据存储方式由 `cli_auth_credentials_store` 控制(`file` = auth.json,`keyring` = 系统钥匙串)。

### 输出结构

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

### 导入步骤

1. 把这份 JSON 保存为 `auth.json`。
2. 放到上面对应系统的路径(目录不存在就手动建 `.codex` 文件夹)。
3. 直接运行 `codex`,它会复用该凭据。

### 注意

- 官方明确:**把 `auth.json` 当密码对待** —— 别提交进仓库、别贴进工单 / 聊天。
- 若 `refresh_token` 为空,Codex 无法自动续期,`access_token` 过期后需重导。
- 无头 / CI 环境:在有浏览器的机器 `codex login` 后,把 `auth.json` 拷到目标机同路径。

<!--SECTION id=axonhub label=AxonHub group=channel-->

# AxonHub

> 多协议认证中枢(auth hub),在其 Web 后台集中管理多家上游账号。它吃的是与 Codex `auth.json` 同源的 `auth_mode: "chatgpt"` + `tokens` 结构。

### 输出结构

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

### 导入步骤

1. 登录 AxonHub 后台 → **Accounts → Import**。
2. 粘贴 / 上传这份 JSON。
3. 保存后账号即进入调度池。

### 注意

- 当来源无 `refresh_token` 时,本工具写入 `__missing_refresh_token__` 占位并附 `axonhub_note` 提示;该账号仅在 `access_token` 过期前可用。

<!--SECTION id=codex-manager label=Codex-Manager group=channel-->

# Codex-Manager

> 本地桌面应用 + 服务进程([`qxcnm/Codex-Manager`](https://github.com/qxcnm/Codex-Manager)),把多个 Codex CLI 账号做成号池并提供 **本地网关转发**,含账号管理与额度统计。

### 数据库位置

- Windows:`%APPDATA%\com.codexmanager.desktop\codexmanager.db`
- macOS:`~/Library/Application Support/com.codexmanager.desktop/codexmanager.db`
- Linux:`~/.local/share/com.codexmanager.desktop/codexmanager.db`

### 输出结构

`tokens` + `meta` 两块:

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

### 导入步骤

1. 打开 Codex-Manager 桌面端 → 点 **启动服务**。
2. 进入 **账号管理 → 添加账号**。
3. 选 **批量导入 / 导入 JSON**:可粘贴这份 JSON、上传文件;桌面版还支持递归导入整个文件夹。
4. 导入后即可在本地网关按号池转发。

### 注意

- 支持批量与文件夹递归导入,适合一次性灌入多账号号池。

<!--SECTION id=notes label=须知 group=guide-->

# 通用须知 · 术语 · FAQ

### 通用注意事项

- **过期与续期**:绝大多数网页会话 token 无 `refresh_token`,过期即失效,需回到「开始」重导。定期看各工具的额度 / 健康度面板。
- **号池 / 拼车风控**:频繁多账号轮换、跨区域复用可能触发官方异常检测。控制并发、错峰使用。
- **凭据安全**:全程本地处理,但输出文件本身仍是敏感凭据 —— 存到加密目录,用完清理,别进版本库。
- **回炉互转**:本工具可把 9Router / Codex / AxonHub / Codex-Manager 等格式再作为输入,转成其它格式,方便多套系统间迁移。

### 术语表

| 字段 | 含义 |
| --- | --- |
| `access_token` | 访问令牌,调用 API 的核心凭据,**等同密码**,有有效期。 |
| `id_token` | 身份令牌(JWT),携带 email / account_id / plan 等声明;缺失时可合成占位。 |
| `refresh_token` | 刷新令牌,用于自动续期;网页会话通常没有。 |
| `session_token` | 网页会话 Cookie(`__Secure-next-auth.session-token`),部分工具需要。 |
| `account_id` | ChatGPT 工作区 / 账号 ID,从 JWT 声明中解析。 |
| `expires` / `expires_at` / `expired` | 过期时间;不同目标用 ISO 字符串或 Unix 时间戳。 |
| `auth_mode` | 认证模式,`chatgpt` 表示用 ChatGPT 订阅而非官方 API Key。 |
| `plan_type` | 订阅档位:`free` / `plus` / `pro` / `team` / `enterprise`。 |

### 常见问题

**Q:导入后很快就 "Token invalid / revoked"?**
A:多半是无 `refresh_token`、`access_token` 已过期。回到「开始」重新导出再导入。

**Q:`/api/auth/session` 返回空 `{}` 或报错?**
A:说明当前浏览器未登录 ChatGPT,或触发了风控。先在 chatgpt.com 正常登录、刷新,再访问该地址。

**Q:一个文件能放多个账号吗?**
A:可以。输入用数组 `[ {…}, {…} ]`,或多文件拖入;工具自动去重、逐个抽取,缺 token 的会被跳过并计入 skipped。

**Q:会不会把我的 token 传到你们服务器?**
A:不会。本工具是纯静态页面,无后端、无网络请求,断网可用。可在浏览器开发者工具的 Network 面板自行验证:锻造时没有任何外发请求。

### 来源 / 参考

- 参考原型:[gtxx3600/GPTSession2CPAandSub2API](https://github.com/gtxx3600/GPTSession2CPAandSub2API)
- Sub2API:[Wei-Shaw/sub2api](https://github.com/Wei-Shaw/sub2api) · CPA:[router-for-me/CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI)
- Cockpit:[jlcodes99/cockpit-tools](https://github.com/jlcodes99/cockpit-tools) · 9Router:[decolua/9router](https://github.com/decolua/9router)
- Codex-Manager:[qxcnm/Codex-Manager](https://github.com/qxcnm/Codex-Manager) · Codex 认证文档:[developers.openai.com/codex/auth](https://developers.openai.com/codex/auth)
