import { useUi, type ToastKind } from "../ui-store";

const KIND: Record<ToastKind, { color: string; glyph: string }> = {
  ok: { color: "#46c8b0", glyph: "✓" },
  error: { color: "#e5544e", glyph: "✕" },
  info: { color: "var(--acc)", glyph: "●" },
};

export function ToastHost() {
  const toasts = useUi((s) => s.toasts);
  const dismiss = useUi((s) => s.dismissToast);

  return (
    <div
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 80,
        display: "flex",
        flexDirection: "column-reverse",
        gap: 8,
        pointerEvents: "none",
      }}
    >
      {toasts.map((toast) => {
        const k = KIND[toast.kind];
        return (
          <button
            key={toast.id}
            onClick={() => dismiss(toast.id)}
            className="focus-ring"
            style={{
              pointerEvents: "auto",
              display: "flex",
              alignItems: "center",
              gap: 10,
              minWidth: 210,
              maxWidth: 340,
              padding: "9px 13px",
              background: "var(--color-hd)",
              border: "1px solid var(--color-b4)",
              borderLeft: `2px solid ${k.color}`,
              color: "var(--color-ink)",
              fontSize: 11.5,
              letterSpacing: ".04em",
              textAlign: "left",
              boxShadow: "0 12px 34px rgba(0,0,0,.5)",
              animation: "sf-toast-in .18s ease",
            }}
          >
            <span style={{ color: k.color, fontSize: 12, flex: "0 0 auto" }}>{k.glyph}</span>
            <span style={{ flex: 1 }}>{toast.text}</span>
          </button>
        );
      })}
    </div>
  );
}
