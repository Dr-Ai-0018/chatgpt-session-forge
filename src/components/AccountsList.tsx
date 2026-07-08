import { getExpiryStatus } from "../core";
import { useForge } from "../store";
import { useUi } from "../ui-store";
import { useI18n } from "../lib/i18n";
import { pad2, statusColor, statusKey } from "../lib/ui";

/** The scrollable accounts + skipped list. Shared by the desktop rail and the mobile drawer. */
export function AccountsList({ onOpen }: { onOpen?: () => void }) {
  const { t } = useI18n();
  const accounts = useForge((s) => s.accounts);
  const skipped = useForge((s) => s.skipped);
  const selectedIdx = useForge((s) => s.selectedIdx);
  const selectAccount = useForge((s) => s.selectAccount);
  const hasRun = useForge((s) => s.hasRun);
  const openModal = useUi((s) => s.openModal);

  function open(i: number) {
    selectAccount(i);
    openModal("detail");
    onOpen?.();
  }

  return (
    <div style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto" }}>
      {accounts.length === 0 && skipped.length === 0 ? (
        <div className="sf-empty" style={{ height: "100%", minHeight: 160, padding: "24px 18px", fontSize: 10.5 }}>
          <span className="glyph">{hasRun ? "∅" : "▚"}</span>
          <span>{hasRun ? t("emptyForged") : t("awaiting")}</span>
        </div>
      ) : (
        <>
          {accounts.map((a, i) => {
            const st = getExpiryStatus(a.expiresAt).status;
            const on = i === selectedIdx;
            const color = statusColor(st);
            return (
              <button
                key={a.id}
                onClick={() => open(i)}
                className="sf-row sf-accrow focus-ring"
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                  padding: "10px 14px",
                  borderBottom: "1px solid var(--color-b3)",
                  background: on ? "#171310" : undefined,
                  borderLeft: `2px solid ${on ? "var(--acc)" : "transparent"}`,
                  textAlign: "left",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
                    <span style={{ color: "var(--color-faint)", fontSize: 10.5, flex: "0 0 auto" }}>{pad2(i + 1)}</span>
                    <span style={{ color: "var(--color-ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {a.name || "—"}
                    </span>
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 5, color, fontSize: 10.5, flex: "0 0 auto" }}>
                    <span style={{ width: 6, height: 6, background: color }} />
                    {t(statusKey(st))}
                  </span>
                </span>
                <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, paddingLeft: 24 }}>
                  <span style={{ color: "var(--color-mut)", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {a.email || "—"}
                  </span>
                  <span className="sf-chev" style={{ flex: "0 0 auto", color: "var(--acc)", fontSize: 12, opacity: 0 }}>›</span>
                </span>
              </button>
            );
          })}

          {skipped.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 14px 4px", fontSize: 9.5, letterSpacing: ".12em", color: "var(--color-red)", textTransform: "uppercase" }}>
                <span>▚ {t("skipped")}</span>
                <span>{pad2(skipped.length)}</span>
              </div>
              {skipped.map((sk, i) => (
                <div key={i} style={{ padding: "6px 14px", borderTop: "1px solid var(--color-b3)" }}>
                  <div style={{ fontSize: 9.5, letterSpacing: ".08em", color: "var(--color-red)", marginBottom: 3 }}>{sk.reason}</div>
                  <div style={{ fontSize: 10.5, color: "var(--color-faint)", wordBreak: "break-all", lineHeight: 1.45 }}>
                    {sk.path}
                    {sk.valuePreview ? ` · ${sk.valuePreview}` : ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
