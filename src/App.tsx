import { lazy, Suspense, useEffect } from "react";
import { Header } from "./components/Header";
import { FormatBar } from "./components/FormatBar";
import { InputPane } from "./components/InputPane";
import { OutputPane } from "./components/OutputPane";
import { AccountsRail } from "./components/AccountsRail";
import { MobileBody } from "./components/MobileBody";
import { AccountsDrawer } from "./components/AccountsDrawer";
import { AccountDetailModal } from "./components/AccountDetailModal";
import { OutputModal } from "./components/OutputModal";
// Guide pulls in react-markdown + highlight.js — load it only when opened.
const GuideModal = lazy(() =>
  import("./components/GuideModal").then((m) => ({ default: m.GuideModal })),
);
import { ToastHost } from "./components/ToastHost";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { ACCENT_HEX, useForge } from "./store";
import { useUi } from "./ui-store";
import { useI18n } from "./lib/i18n";
import { useMediaQuery } from "./lib/useMediaQuery";
import { cssVars } from "./lib/ui";

function Corner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const v = pos[0] === "t" ? { top: 7 } : { bottom: 7 };
  const h = pos[1] === "l" ? { left: 7 } : { right: 7 };
  const border = pos[0] === "t" ? { borderTop: "1px solid var(--acc)" } : { borderBottom: "1px solid var(--acc)" };
  const borderSide = pos[1] === "l" ? { borderLeft: "1px solid var(--acc)" } : { borderRight: "1px solid var(--acc)" };
  return <div style={{ position: "fixed", width: 15, height: 15, opacity: 0.55, pointerEvents: "none", zIndex: 60, ...v, ...h, ...border, ...borderSide }} />;
}

export default function App() {
  const accent = useForge((s) => s.accent);
  const modal = useUi((s) => s.modal);
  const drawerOpen = useUi((s) => s.drawerOpen);
  const { t } = useI18n();
  const wide = useMediaQuery("(min-width: 1024px)");

  // ⌘/Ctrl + Enter → forge, from anywhere.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        useForge.getState().forge();
        const n = useForge.getState().accounts.length;
        useUi.getState().pushToast(n ? "ok" : "error", n ? `${t("toast.forgedA")} ${n} ${t("toast.forgedB")}` : t("toast.forgedNone"));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [t]);

  return (
    <div
      style={{
        ...cssVars({ "--acc": ACCENT_HEX[accent] }),
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--color-bg)",
        backgroundImage: "radial-gradient(rgba(255,255,255,.018) 1px, transparent 0)",
        backgroundSize: "22px 22px",
        color: "var(--color-ink)",
        overflow: "hidden",
      }}
    >
      <Corner pos="tl" />
      <Corner pos="tr" />
      <Corner pos="bl" />
      <Corner pos="br" />

      <Header />
      <FormatBar />

      {wide ? (
        <main style={{ flex: "1 1 auto", minHeight: 0, display: "flex", flexDirection: "row", overflow: "hidden" }}>
          <InputPane wide />
          <OutputPane wide />
          <aside style={{ flex: "0 0 340px", minWidth: 320, minHeight: 0, display: "flex", flexDirection: "column" }}>
            <AccountsRail />
          </aside>
        </main>
      ) : (
        <MobileBody />
      )}

      <ToastHost />
      <ConfirmDialog />
      {!wide && drawerOpen && <AccountsDrawer />}
      {modal === "detail" && <AccountDetailModal />}
      {modal === "output" && <OutputModal />}
      {modal === "guide" && (
        <Suspense fallback={null}>
          <GuideModal />
        </Suspense>
      )}
    </div>
  );
}
