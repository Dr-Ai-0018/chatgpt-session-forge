import { useState } from "react";
import { createDownloadFilename, getTargetLabel } from "../core";
import { useForge } from "../store";
import { useUi } from "../ui-store";
import { useI18n } from "../lib/i18n";
import { copyText, downloadText } from "../lib/clipboard";

export function OutputPane({ wide }: { wide: boolean }) {
  const { t } = useI18n();
  const outputText = useForge((s) => s.outputText);
  const format = useForge((s) => s.format);
  const forging = useForge((s) => s.forging);
  const accounts = useForge((s) => s.accounts);
  const pushToast = useUi((s) => s.pushToast);
  const openModal = useUi((s) => s.openModal);

  const [copied, setCopied] = useState(false);

  async function onCopy() {
    if (!outputText) return pushToast("error", t("toast.noOutput"));
    const ok = await copyText(outputText);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1300);
      pushToast("ok", t("toast.copied"));
    } else {
      pushToast("error", t("toast.copyFail"));
    }
  }

  function onDownload() {
    if (!outputText) return pushToast("error", t("toast.noOutput"));
    downloadText(createDownloadFilename(format), outputText);
    pushToast("ok", t("toast.downloaded"));
  }

  return (
    <div
      style={{
        ...(wide
          ? { flex: "1.2 1 0", minWidth: 360, minHeight: 0, borderRight: "1px solid var(--color-b1)" }
          : { flex: "1 1 0", width: "100%", minHeight: 0 }),
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div className="sf-hd">
        <span className="sf-hd-title">
          <span className="acc">◈</span>
          {t("output")} · {getTargetLabel(format)}
          {outputText && (
            <span style={{ marginLeft: 6, color: "var(--color-faint)", letterSpacing: ".06em", textTransform: "none" }}>
              {accounts.length}·{outputText.length}
            </span>
          )}
        </span>
        <span style={{ display: "flex", gap: 8 }}>
          <button
            className="sf-btn focus-ring"
            onClick={onCopy}
            style={copied ? { borderColor: "var(--color-teal)", color: "var(--color-teal)" } : undefined}
          >
            {copied ? t("copied") : t("copy")}
          </button>
          <button className="sf-btn focus-ring" onClick={onDownload}>
            {t("download")}
          </button>
          <button
            className="sf-btn focus-ring"
            onClick={() => outputText && openModal("output")}
            title={t("full")}
            aria-label={t("full")}
          >
            ⛶
          </button>
        </span>
      </div>

      <div style={{ flex: "1 1 auto", minHeight: 0, overflow: "auto", background: "var(--color-code)" }}>
        {outputText ? (
          <pre
            key={format + outputText.length}
            className="sf-fade"
            style={{
              margin: 0,
              padding: "14px 16px",
              color: "#c9c2b2",
              fontSize: 12.5,
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
            }}
          >
            {outputText}
          </pre>
        ) : (
          <div className="sf-empty" style={{ height: "100%", padding: 20 }}>
            <span className="glyph">⟡</span>
            <span style={{ fontSize: 11.5, color: "var(--color-dim)" }}>{t("emptyOut")}</span>
          </div>
        )}
      </div>

      {forging && (
        <div
          style={{
            position: "absolute",
            top: 30,
            bottom: 0,
            width: "32%",
            background: "linear-gradient(90deg, transparent, color-mix(in oklab, var(--acc) 18%, transparent), transparent)",
            animation: "sf-sweep .3s linear",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}
