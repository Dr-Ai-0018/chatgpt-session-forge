import { createDownloadFilename, getTargetLabel } from "../core";
import { useForge } from "../store";
import { useUi } from "../ui-store";
import { useI18n } from "../lib/i18n";
import { copyText, downloadText } from "../lib/clipboard";
import { Modal } from "./Modal";

export function OutputModal() {
  const { t } = useI18n();
  const outputText = useForge((s) => s.outputText);
  const format = useForge((s) => s.format);
  const accounts = useForge((s) => s.accounts);
  const closeModal = useUi((s) => s.closeModal);
  const pushToast = useUi((s) => s.pushToast);

  return (
    <Modal
      title={`${t("outputFullTitle")} · ${getTargetLabel(format)}`}
      onClose={closeModal}
      size="full"
      meta={
        <span style={{ fontSize: 10.5, letterSpacing: ".1em", color: "var(--color-faint)" }}>
          {accounts.length} {t("stAccounts")} · {outputText.length} {t("chars")}
        </span>
      }
      footer={
        <>
          <button
            className="sf-btn focus-ring"
            onClick={async () => {
              const ok = await copyText(outputText);
              pushToast(ok ? "ok" : "error", ok ? t("toast.copied") : t("toast.copyFail"));
            }}
          >
            {t("copy")}
          </button>
          <button
            className="sf-btn focus-ring"
            onClick={() => {
              downloadText(createDownloadFilename(format), outputText);
              pushToast("ok", t("toast.downloaded"));
            }}
          >
            {t("download")}
          </button>
        </>
      }
    >
      <pre style={{ margin: 0, padding: "16px 18px", color: "#c9c2b2", fontSize: 12.5, lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
        {outputText}
      </pre>
    </Modal>
  );
}
