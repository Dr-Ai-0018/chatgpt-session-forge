import { useEffect } from "react";
import { useUi } from "../ui-store";

export function ConfirmDialog() {
  const req = useUi((s) => s.confirmRequest);
  const resolve = useUi((s) => s.resolveConfirm);

  useEffect(() => {
    if (!req) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") resolve(false);
      if (e.key === "Enter") resolve(true);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [req, resolve]);

  if (!req) return null;

  return (
    <div
      onClick={() => resolve(false)}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 90,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(3,3,2,.66)",
        backdropFilter: "blur(2px)",
        animation: "sf-overlay-in .16s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(420px, 100%)",
          background: "var(--color-hd)",
          border: "1px solid var(--color-b4)",
          boxShadow: "0 30px 80px rgba(0,0,0,.6)",
          animation: "sf-modal-in .18s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 14px", borderBottom: "1px solid var(--color-b2)" }}>
          <span className="sf-pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--acc)" }} />
          <span style={{ fontSize: 11, letterSpacing: ".16em", color: "var(--acc)", textTransform: "uppercase" }}>
            {req.title}
          </span>
        </div>
        <div style={{ padding: "16px 14px", fontSize: 12.5, lineHeight: 1.7, color: "var(--color-ink2)" }}>
          {req.message}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "0 14px 14px" }}>
          <button className="sf-btn focus-ring" onClick={() => resolve(false)}>
            {req.cancelLabel}
          </button>
          <button
            className="focus-ring"
            onClick={() => resolve(true)}
            style={{
              border: "1px solid var(--color-red)",
              color: "var(--color-red)",
              padding: "5px 13px",
              fontSize: 10.5,
              letterSpacing: ".12em",
              textTransform: "uppercase",
              transition: "background .16s ease, color .16s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--color-red)";
              e.currentTarget.style.color = "#0b0a09";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--color-red)";
            }}
          >
            {req.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
