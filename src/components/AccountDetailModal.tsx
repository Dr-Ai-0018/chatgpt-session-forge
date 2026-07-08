import { useMemo, useState } from "react";
import { convertOne, decodeJwt, getExpiryStatus, getTargetLabel, maskSecret } from "../core";
import { useForge } from "../store";
import { useUi } from "../ui-store";
import { useI18n } from "../lib/i18n";
import { copyText } from "../lib/clipboard";
import { fmtDate, statusColor, statusKey } from "../lib/ui";
import { Modal } from "./Modal";

type Tab = "overview" | "jwt" | "record";

function Field({ label, value, color, mono }: { label: string; value: string; color?: string; mono?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "9px 0", borderBottom: "1px solid var(--color-b2)" }}>
      <span style={{ flex: "0 0 auto", fontSize: 10, letterSpacing: ".12em", color: "var(--color-faint)", textTransform: "uppercase" }}>
        {label}
      </span>
      <span style={{ textAlign: "right", wordBreak: "break-all", color: color ?? "var(--color-ink)", fontFamily: mono ? "var(--font-mono)" : undefined, fontSize: 12.5 }}>
        {value || "—"}
      </span>
    </div>
  );
}

const preStyle = {
  margin: 0,
  padding: 12,
  background: "var(--color-code)",
  border: "1px solid var(--color-b2)",
  fontSize: 12,
  lineHeight: 1.55,
  whiteSpace: "pre-wrap" as const,
  wordBreak: "break-all" as const,
};

export function AccountDetailModal() {
  const { t } = useI18n();
  const accounts = useForge((s) => s.accounts);
  const selectedIdx = useForge((s) => s.selectedIdx);
  const format = useForge((s) => s.format);
  const closeModal = useUi((s) => s.closeModal);
  const pushToast = useUi((s) => s.pushToast);

  const [tab, setTab] = useState<Tab>("overview");
  const account = accounts.length ? accounts[Math.min(selectedIdx, accounts.length - 1)] : null;

  const jwt = useMemo(() => (account ? decodeJwt(account.accessToken) : null), [account]);
  const record = useMemo(
    () => (account ? JSON.stringify(convertOne(account, format), null, 2) : ""),
    [account, format],
  );

  if (!account) return null;
  const st = getExpiryStatus(account.expiresAt);

  const TABS: { id: Tab; label: string }[] = [
    { id: "overview", label: t("tabOverview") },
    { id: "jwt", label: t("tabJwt") },
    { id: "record", label: t("tabRecord") },
  ];

  return (
    <Modal
      title={`${t("detailTitle")} · ${account.email || account.id}`}
      onClose={closeModal}
      size="lg"
    >
      {/* tab strip */}
      <div style={{ flex: "0 0 auto", display: "flex", gap: 6, padding: "10px 14px", borderBottom: "1px solid var(--color-b2)" }}>
        {TABS.map((tb) => {
          const on = tb.id === tab;
          return (
            <button
              key={tb.id}
              onClick={() => setTab(tb.id)}
              className="sf-chip focus-ring"
              style={{
                height: 28,
                padding: "0 14px",
                fontSize: 11.5,
                letterSpacing: ".08em",
                color: on ? "#0b0a09" : "var(--color-ink2)",
                background: on ? "var(--acc)" : "transparent",
                border: `1px solid ${on ? "var(--acc)" : "var(--color-b4)"}`,
              }}
            >
              {tb.label}
            </button>
          );
        })}
      </div>

      <div className="sf-fade" key={tab} style={{ padding: "6px 16px 18px" }}>
        {tab === "overview" && (
          <div>
            <Field label={t("mEmail")} value={account.email || "—"} />
            <Field label={t("mName")} value={account.name || "—"} />
            <Field label={t("mProvider")} value={account.authProvider || account.outputSource || "—"} color="var(--color-ink2)" />
            <Field label={t("mPlan")} value={account.planType || "—"} />
            <Field
              label={t("mExpires")}
              value={account.expiresAt ? `${fmtDate(account.expiresAt)} · ${t(statusKey(st.status))}` : t("st_unknown")}
              color={statusColor(st.status)}
            />
            <Field label={t("mAcctId")} value={account.chatgptAccountId || account.accountId || "—"} mono />
            <Field label={t("mWorkspace")} value={account.workspaceId || "—"} mono />
            <Field label={t("mToken")} value={maskSecret(account.accessToken)} mono color="var(--color-ink2)" />
            <Field label={t("mRefresh")} value={account.refreshToken ? maskSecret(account.refreshToken) : "—"} mono color="var(--color-ink2)" />
            <Field label={t("mSession")} value={account.sessionToken ? maskSecret(account.sessionToken) : "—"} mono color="var(--color-ink2)" />
          </div>
        )}

        {tab === "jwt" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingTop: 8 }}>
            <span style={{ fontSize: 9.5, letterSpacing: ".14em", color: "var(--color-faint)", textTransform: "uppercase" }}>{t("jwtHeader")}</span>
            <pre style={{ ...preStyle, color: "#8fb8ad" }}>{jwt?.header ? JSON.stringify(jwt.header, null, 2) : t("notJwt")}</pre>
            <span style={{ marginTop: 8, fontSize: 9.5, letterSpacing: ".14em", color: "var(--color-faint)", textTransform: "uppercase" }}>{t("jwtPayload")}</span>
            <pre style={{ ...preStyle, color: "#c9c2b2" }}>{jwt?.payload ? JSON.stringify(jwt.payload, null, 2) : t("notJwt")}</pre>
            <span style={{ marginTop: 8, fontSize: 9.5, letterSpacing: ".14em", color: "var(--color-faint)", textTransform: "uppercase" }}>{t("signature")}</span>
            <div style={{ ...preStyle, border: "1px dashed var(--color-b4)", color: "var(--color-faint)" }}>{jwt?.signature ? maskSecret(jwt.signature) : "—"}</div>
          </div>
        )}

        {tab === "record" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 8 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 9.5, letterSpacing: ".14em", color: "var(--acc)", textTransform: "uppercase" }}>
                {t("record")} · {getTargetLabel(format)}
              </span>
              <button
                className="sf-btn focus-ring"
                onClick={async () => {
                  const ok = await copyText(record);
                  pushToast(ok ? "ok" : "error", ok ? t("toast.copied") : t("toast.copyFail"));
                }}
              >
                {t("copy")}
              </button>
            </div>
            <pre style={{ ...preStyle, background: "color-mix(in oklab, var(--acc) 8%, #0b0a09)", border: "1px solid color-mix(in oklab, var(--acc) 22%, transparent)", color: "#e6ddc9" }}>
              {record}
            </pre>
          </div>
        )}
      </div>
    </Modal>
  );
}
