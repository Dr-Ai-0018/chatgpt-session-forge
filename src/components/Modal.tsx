import { useEffect, type ReactNode } from "react";

/** Reusable terminal-styled modal: dimmed backdrop, esc/backdrop close, LED title bar. */
export function Modal({
  title,
  meta,
  onClose,
  children,
  footer,
  size = "md",
}: {
  title: string;
  meta?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: "md" | "lg" | "full";
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const width = size === "full" ? "min(1100px, 96vw)" : size === "lg" ? "min(880px, 94vw)" : "min(560px, 94vw)";
  const height = size === "full" ? "min(86vh, 900px)" : "auto";
  const maxHeight = size === "full" ? "86vh" : "82vh";

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 90,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background: "rgba(3,3,2,.68)",
        backdropFilter: "blur(2px)",
        animation: "sf-overlay-in .16s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width,
          height,
          maxHeight,
          display: "flex",
          flexDirection: "column",
          background: "var(--color-hd)",
          border: "1px solid var(--color-b4)",
          boxShadow: "0 34px 90px rgba(0,0,0,.65)",
          animation: "sf-modal-in .18s ease",
          overflow: "hidden",
        }}
      >
        <div className="sf-hd" style={{ flex: "0 0 auto" }}>
          <span className="sf-hd-title">
            <span className="acc">◈</span>
            {title}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {meta}
            <button
              className="focus-ring"
              onClick={onClose}
              aria-label="close"
              style={{ color: "var(--color-mut)", fontSize: 14, lineHeight: 1, padding: "2px 4px" }}
            >
              ✕
            </button>
          </span>
        </div>

        <div style={{ flex: "1 1 auto", minHeight: 0, overflow: "auto", display: "flex", flexDirection: "column" }}>
          {children}
        </div>

        {footer && (
          <div style={{ flex: "0 0 auto", display: "flex", justifyContent: "flex-end", gap: 8, padding: "10px 14px", borderTop: "1px solid var(--color-b2)" }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
