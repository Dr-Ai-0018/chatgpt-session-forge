import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type Locale = "zh" | "en";

type Entry = { zh: string; en: string };
type Dict = Record<string, Entry>;

const DICT: Dict = {
  tagline: { zh: "会话凭证锻造台", en: "SESSION CREDENTIAL FORGE" },
  offline: { zh: "物理隔离", en: "AIR-GAPPED" },
  offlineSub: { zh: "无联网 · 内存运行 · 零落盘", en: "NO NET · IN-MEMORY · ZERO WRITE" },

  inputTitle: { zh: "会话输入", en: "SESSION INPUT" },
  srcHint: { zh: "凭据来源 →", en: "Get JSON from →" },
  srcHintGuide: { zh: "查看教程 ?", en: "How-to ?" },
  inputPlaceholder: {
    zh: "// 登录 chatgpt.com 后打开 chatgpt.com/api/auth/session\n// 复制返回的完整 JSON（下面仅展示结构，值均为脱敏占位符）\n{\n  \"WARNING_BANNER\": \"DO NOT SHARE...\",\n  \"user\": {\n    \"id\": \"user-...\",\n    \"name\": \"...\",\n    \"email\": \"...\",\n    \"idp\": \"auth0\",\n    \"iat\": 1751322000,\n    \"amr\": [\"otp\", \"urn:openai:amr:otp_email\"],\n    \"mfa\": false\n  },\n  \"expires\": \"2026-10-09T06:24:30.200Z\",\n  \"account\": {\n    \"id\": \"acct-...\",\n    \"planType\": \"k12\",\n    \"structure\": \"workspace\",\n    \"organizationId\": \"org-...\",\n    \"workspaceType\": \"production\"\n  },\n  \"accessToken\": \"eyJ...\",\n  \"authProvider\": \"openai\",\n  \"sessionToken\": \"eyJ...\",\n  \"rumViewTags\": { \"light_account\": { \"fetched\": false } }\n}",
    en: "// Sign in at chatgpt.com, then open chatgpt.com/api/auth/session\n// Copy the complete JSON response (values below are redacted placeholders)\n{\n  \"WARNING_BANNER\": \"DO NOT SHARE...\",\n  \"user\": {\n    \"id\": \"user-...\",\n    \"name\": \"...\",\n    \"email\": \"...\",\n    \"idp\": \"auth0\",\n    \"iat\": 1751322000,\n    \"amr\": [\"otp\", \"urn:openai:amr:otp_email\"],\n    \"mfa\": false\n  },\n  \"expires\": \"2026-10-09T06:24:30.200Z\",\n  \"account\": {\n    \"id\": \"acct-...\",\n    \"planType\": \"k12\",\n    \"structure\": \"workspace\",\n    \"organizationId\": \"org-...\",\n    \"workspaceType\": \"production\"\n  },\n  \"accessToken\": \"eyJ...\",\n  \"authProvider\": \"openai\",\n  \"sessionToken\": \"eyJ...\",\n  \"rumViewTags\": { \"light_account\": { \"fetched\": false } }\n}",
  },
  addFiles: { zh: "添加文件", en: "ADD FILES" },
  dropHint: { zh: "或拖入 .json", en: "or drop .json here" },
  mFiles: { zh: "个文件", en: "FILES" },
  mPasteDrop: { zh: "粘贴 / 拖入", en: "PASTE / DROP" },
  sample: { zh: "示例", en: "SAMPLE" },
  clear: { zh: "清空", en: "CLEAR" },
  fmtTitle: { zh: "输出格式", en: "OUTPUT FORMAT" },
  forge: { zh: "锻造", en: "FORGE" },

  stAccounts: { zh: "账号", en: "ACCOUNTS" },
  stFormat: { zh: "格式", en: "FORMAT" },
  stSkipped: { zh: "跳过", en: "SKIPPED" },
  stExpiring: { zh: "临期", en: "EXPIRING" },

  thName: { zh: "名称", en: "NAME" },
  thEmail: { zh: "邮箱", en: "EMAIL" },
  thStatus: { zh: "状态", en: "STATUS" },
  thSource: { zh: "来源", en: "SOURCE" },

  st_valid: { zh: "有效", en: "VALID" },
  st_soon: { zh: "即将过期", en: "SOON" },
  st_expired: { zh: "已过期", en: "EXPIRED" },
  st_unknown: { zh: "未知", en: "UNKNOWN" },

  inspector: { zh: "检视器", en: "INSPECTOR" },
  noSel: { zh: "未选择账号", en: "NO ACCOUNT SELECTED" },
  mEmail: { zh: "邮箱", en: "EMAIL" },
  mProvider: { zh: "提供方", en: "PROVIDER" },
  mExpires: { zh: "过期", en: "EXPIRES" },
  mToken: { zh: "访问令牌", en: "ACCESS TOKEN" },
  jwtHeader: { zh: "JWT · 头部", en: "JWT · HEADER" },
  jwtPayload: { zh: "JWT · 载荷", en: "JWT · PAYLOAD" },
  notJwt: { zh: "// 无法解码的 JWT", en: "// not a decodable JWT" },
  signature: { zh: "签名 · 已打码", en: "SIGNATURE · MASKED" },
  record: { zh: "单条记录", en: "RECORD" },

  output: { zh: "输出", en: "OUTPUT" },
  copy: { zh: "复制", en: "COPY" },
  copied: { zh: "已复制 ✓", en: "COPIED ✓" },
  download: { zh: "下载", en: "DOWNLOAD" },
  emptyOut: { zh: "// 运行「锻造」以生成输出", en: "// run FORGE to generate output" },

  skipped: { zh: "已跳过", en: "SKIPPED" },
  noSkipped: { zh: "无跳过项", en: "no skipped entries" },

  // detail modal + tabs + actions
  detailTitle: { zh: "账号详情", en: "ACCOUNT DETAIL" },
  outputFullTitle: { zh: "输出 · 全屏", en: "OUTPUT · FULLSCREEN" },
  tabOverview: { zh: "概要", en: "OVERVIEW" },
  tabJwt: { zh: "JWT", en: "JWT" },
  tabRecord: { zh: "单条输出", en: "RECORD" },
  full: { zh: "全屏", en: "FULL" },
  detailHint: { zh: "点击账号查看详情", en: "Click a row for details" },
  vInput: { zh: "输入", en: "INPUT" },
  vOutput: { zh: "输出", en: "OUTPUT" },
  expand: { zh: "展开", en: "OPEN" },
  chars: { zh: "字符", en: "CHARS" },
  mName: { zh: "名称", en: "NAME" },
  mPlan: { zh: "套餐", en: "PLAN" },
  mAcctId: { zh: "账号 ID", en: "ACCOUNT ID" },
  mWorkspace: { zh: "工作区", en: "WORKSPACE" },
  mRefresh: { zh: "刷新令牌", en: "REFRESH TOKEN" },
  mSession: { zh: "会话令牌", en: "SESSION TOKEN" },

  awaiting: {
    zh: "等待输入 — 粘贴会话 JSON,选择格式,运行锻造",
    en: "AWAITING INPUT — PASTE SESSION JSON, PICK A FORMAT, RUN FORGE",
  },
  emptyForged: { zh: "未识别到账号", en: "No accounts found" },

  // toasts
  "toast.copied": { zh: "已复制到剪贴板", en: "Copied to clipboard" },
  "toast.copyFail": { zh: "复制失败,请手动选中", en: "Copy failed — select manually" },
  "toast.downloaded": { zh: "下载已开始", en: "Download started" },
  "toast.noOutput": { zh: "没有可用输出,请先锻造", en: "No output — run FORGE first" },
  "toast.forgedNone": { zh: "未识别到可转换账号", en: "No convertible accounts found" },
  "toast.forgedA": { zh: "锻造完成 · 识别", en: "Forged ·" },
  "toast.forgedB": { zh: "个账号", en: "accounts" },
  "toast.sample": { zh: "已载入示例(假 token)", en: "Sample loaded (fake tokens)" },
  "toast.cleared": { zh: "已清空", en: "Cleared" },

  // setup guide
  guide: { zh: "教程", en: "GUIDE" },
  guideTitle: { zh: "配置教程", en: "SETUP GUIDE" },
  guideMeta: { zh: "本地离线 · 仅供参考", en: "OFFLINE · REFERENCE" },
  guideBasics: { zh: "指南", en: "BASICS" },
  guideChannels: { zh: "渠道", en: "CHANNELS" },
  guidePrev: { zh: "上一个", en: "PREV" },
  guideNext: { zh: "下一个", en: "NEXT" },

  // confirm dialog
  "confirm.clearTitle": { zh: "确认清空", en: "CONFIRM CLEAR" },
  "confirm.clearMsg": {
    zh: "将清除当前输入、文件与所有结果。此操作不可撤销。",
    en: "This clears the current input, files, and all results. Cannot be undone.",
  },
  "confirm.yes": { zh: "清空", en: "CLEAR" },
  "confirm.no": { zh: "取消", en: "CANCEL" },
};

interface I18nValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("zh");
  const value = useMemo<I18nValue>(
    () => ({
      locale,
      setLocale,
      t: (key) => {
        const entry = DICT[key];
        return entry ? entry[locale] : key;
      },
    }),
    [locale],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
