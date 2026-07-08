import { getExpiryStatus } from "../core";
import { useForge } from "../store";
import { useUi } from "../ui-store";
import { useI18n } from "../lib/i18n";
import { pad2 } from "../lib/ui";
import { InputPane } from "./InputPane";
import { OutputPane } from "./OutputPane";

export function MobileBody() {
  const { t } = useI18n();
  const accounts = useForge((s) => s.accounts);
  const skipped = useForge((s) => s.skipped);
  const mobileView = useUi((s) => s.mobileView);
  const setMobileView = useUi((s) => s.setMobileView);
  const setDrawer = useUi((s) => s.setDrawer);

  const expiring = accounts.filter((a) => {
    const k = getExpiryStatus(a.expiresAt).status;
    return k === "expired" || k === "expiringSoon";
  }).length;

  const seg = (id: "input" | "output", label: string) => {
    const on = mobileView === id;
    return (
      <button
        onClick={() => setMobileView(id)}
        className="focus-ring"
        style={{
          flex: 1,
          height: 34,
          fontSize: 12,
          letterSpacing: ".12em",
          textTransform: "uppercase",
          color: on ? "#0b0a09" : "var(--color-ink2)",
          background: on ? "var(--acc)" : "transparent",
          border: `1px solid ${on ? "var(--acc)" : "var(--color-b4)"}`,
          transition: "background .15s ease, color .15s ease",
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <div style={{ flex: "1 1 auto", minHeight: 0, display: "flex", flexDirection: "column" }}>
      {/* input / output switch */}
      <div style={{ flex: "0 0 auto", display: "flex", gap: 6, padding: "8px 12px", borderBottom: "1px solid var(--color-b1)", background: "var(--color-hd)" }}>
        {seg("input", t("vInput"))}
        {seg("output", t("vOutput"))}
      </div>

      {/* active pane fills the rest */}
      <div style={{ flex: "1 1 auto", minHeight: 0, display: "flex" }}>
        {mobileView === "input" ? <InputPane wide={false} /> : <OutputPane wide={false} />}
      </div>

      {/* bottom accounts bar → opens the drawer */}
      <button
        onClick={() => setDrawer(true)}
        className="focus-ring"
        style={{
          flex: "0 0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 44,
          padding: "0 14px",
          borderTop: "1px solid var(--color-b1)",
          background: "var(--color-hd)",
          textAlign: "left",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, letterSpacing: ".08em", color: "var(--color-mut)" }}>
          <span className="acc">◈</span>
          <span style={{ color: "var(--acc)" }}>{pad2(accounts.length)}</span> {t("stAccounts")}
          <span style={{ color: "var(--color-faint)" }}>·</span>
          <span style={{ color: "var(--color-mut)" }}>{pad2(skipped.length)}</span> {t("stSkipped")}
          {expiring > 0 && (
            <>
              <span style={{ color: "var(--color-faint)" }}>·</span>
              <span style={{ color: "var(--color-red)" }}>{pad2(expiring)}</span> {t("stExpiring")}
            </>
          )}
        </span>
        <span style={{ fontSize: 11, letterSpacing: ".1em", color: "var(--acc)", textTransform: "uppercase" }}>
          {t("expand")} ▲
        </span>
      </button>
    </div>
  );
}
