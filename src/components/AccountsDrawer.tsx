import { useEffect } from "react";
import { useForge } from "../store";
import { useUi } from "../ui-store";
import { useI18n } from "../lib/i18n";
import { pad2 } from "../lib/ui";
import { AccountsList } from "./AccountsList";

/** Mobile bottom-sheet drawer holding the accounts list. */
export function AccountsDrawer() {
  const { t } = useI18n();
  const accounts = useForge((s) => s.accounts);
  const setDrawer = useUi((s) => s.setDrawer);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setDrawer(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setDrawer]);

  return (
    <div
      onClick={() => setDrawer(false)}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 70,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        background: "rgba(3,3,2,.6)",
        backdropFilter: "blur(2px)",
        animation: "sf-overlay-in .16s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: "flex",
          flexDirection: "column",
          maxHeight: "72vh",
          background: "var(--color-hd)",
          borderTop: "1px solid var(--color-b4)",
          boxShadow: "0 -20px 60px rgba(0,0,0,.6)",
          animation: "sf-sheet-in .22s cubic-bezier(.2,.7,.3,1)",
        }}
      >
        {/* grab handle + header */}
        <div style={{ flex: "0 0 auto", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 8 }}>
          <span style={{ width: 38, height: 4, borderRadius: 2, background: "var(--color-b4)" }} />
        </div>
        <div className="sf-hd" style={{ borderTop: "none" }}>
          <span className="sf-hd-title">
            <span className="acc">◈</span>
            {t("stAccounts")} · {pad2(accounts.length)}
          </span>
          <button className="focus-ring" onClick={() => setDrawer(false)} aria-label="close" style={{ color: "var(--color-mut)", fontSize: 14, padding: "2px 4px" }}>
            ✕
          </button>
        </div>

        <AccountsList onOpen={() => setDrawer(false)} />
      </div>
    </div>
  );
}
