import { getExpiryStatus, TARGETS } from "../core";
import { useForge } from "../store";
import { useUi } from "../ui-store";
import { useI18n } from "../lib/i18n";
import { useMediaQuery } from "../lib/useMediaQuery";
import { pad2 } from "../lib/ui";

export function FormatBar() {
  const { t } = useI18n();
  const format = useForge((s) => s.format);
  const setFormat = useForge((s) => s.setFormat);
  const forge = useForge((s) => s.forge);
  const accounts = useForge((s) => s.accounts);
  const skipped = useForge((s) => s.skipped);
  const pushToast = useUi((s) => s.pushToast);
  const setMobileView = useUi((s) => s.setMobileView);
  const wide = useMediaQuery("(min-width: 1024px)");

  let expired = 0;
  let soon = 0;
  accounts.forEach((a) => {
    const k = getExpiryStatus(a.expiresAt).status;
    if (k === "expired") expired++;
    else if (k === "expiringSoon") soon++;
  });

  function onForge() {
    forge();
    const n = useForge.getState().accounts.length;
    if (!n) {
      pushToast("error", t("toast.forgedNone"));
    } else {
      pushToast("ok", `${t("toast.forgedA")} ${n} ${t("toast.forgedB")}`);
      setMobileView("output"); // on phones, jump to the result after forging
    }
  }

  function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
    return (
      <span style={{ display: "inline-flex", alignItems: "baseline", gap: 5 }}>
        <span style={{ fontSize: 14, color: color ?? "var(--color-ink)", lineHeight: 1 }}>{value}</span>
        <span style={{ fontSize: 9, letterSpacing: ".14em", color: "var(--color-mut)", textTransform: "uppercase" }}>
          {label}
        </span>
      </span>
    );
  }

  return (
    <div
      style={{
        flex: "0 0 auto",
        display: "flex",
        alignItems: "center",
        gap: 14,
        height: 48,
        padding: "0 14px 0 16px",
        borderBottom: "1px solid var(--color-b1)",
        background: "var(--color-hd)",
      }}
    >
      <span className="prompt" style={{ flex: "0 0 auto", fontSize: 11, letterSpacing: ".14em", color: "var(--color-faint)", textTransform: "uppercase" }}>
        target
      </span>

      <div className="sf-chipbar" style={{ flex: "1 1 auto", minWidth: 0, display: "flex", gap: 6, overflowX: "auto" }}>
        {TARGETS.map((tgt) => {
          const on = tgt.id === format;
          return (
            <button
              key={tgt.id}
              onClick={() => setFormat(tgt.id)}
              title={tgt.blurb}
              className="sf-chip focus-ring"
              style={{
                flex: "0 0 auto",
                height: 30,
                padding: "0 12px",
                fontSize: 12,
                letterSpacing: ".02em",
                color: on ? "#0b0a09" : "var(--color-ink2)",
                background: on ? "var(--acc)" : "transparent",
                border: `1px solid ${on ? "var(--acc)" : "var(--color-b4)"}`,
                transition: "background .15s ease, color .15s ease, border-color .15s ease",
              }}
            >
              {tgt.label}
            </button>
          );
        })}
      </div>

      {wide && (
        <div style={{ flex: "0 0 auto", display: "flex", gap: 16, paddingRight: 4, borderRight: "1px solid var(--color-b1)", marginRight: 2 }}>
          <Stat label={t("stAccounts")} value={pad2(accounts.length)} color="var(--acc)" />
          <Stat label={t("stSkipped")} value={pad2(skipped.length)} color="var(--color-mut)" />
          <Stat
            label={t("stExpiring")}
            value={pad2(expired + soon)}
            color={expired ? "var(--color-red)" : soon ? "var(--acc)" : "var(--color-mut)"}
          />
        </div>
      )}

      <button
        onClick={onForge}
        title="⌘/Ctrl + Enter"
        className="focus-ring sf-forge"
        style={{
          flex: "0 0 auto",
          height: 38,
          padding: "0 26px",
          fontSize: 12.5,
          letterSpacing: ".28em",
          textTransform: "uppercase",
          display: "inline-flex",
          alignItems: "center",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          <span className="sf-forge-spark" style={{ fontSize: 14, display: "inline-block" }}>⟡</span>
          {t("forge")}
          <span style={{ fontSize: 10, letterSpacing: 0, opacity: 0.5 }}>⌘⏎</span>
        </span>
      </button>
    </div>
  );
}
