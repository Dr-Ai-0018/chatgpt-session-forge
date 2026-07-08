import { useRef, useState } from "react";
import { useForge } from "../store";
import { useUi } from "../ui-store";
import { useI18n } from "../lib/i18n";

export function InputPane({ wide }: { wide: boolean }) {
  const { t } = useI18n();
  const rawInput = useForge((s) => s.rawInput);
  const files = useForge((s) => s.files);
  const setInput = useForge((s) => s.setInput);
  const addFiles = useForge((s) => s.addFiles);
  const removeFile = useForge((s) => s.removeFile);
  const clearAll = useForge((s) => s.clearAll);
  const loadSample = useForge((s) => s.loadSample);

  const pushToast = useUi((s) => s.pushToast);
  const confirm = useUi((s) => s.confirm);
  const fileRef = useRef<HTMLInputElement>(null);

  const [dragging, setDragging] = useState(false);
  const [focused, setFocused] = useState(false);

  const filesMeta = files.length
    ? `${files.length} ${files.length === 1 ? "FILE" : "FILES"}`
    : "PASTE / DROP";

  async function onClear() {
    const ok = await confirm({
      title: t("confirm.clearTitle"),
      message: t("confirm.clearMsg"),
      confirmLabel: t("confirm.yes"),
      cancelLabel: t("confirm.no"),
    });
    if (ok) {
      clearAll();
      pushToast("info", t("toast.cleared"));
    }
  }

  return (
    <div
      style={{
        ...(wide
          ? { flex: "1 1 0", minWidth: 340, minHeight: 0, borderRight: "1px solid var(--color-b1)" }
          : { flex: "1 1 0", width: "100%", minHeight: 0 }),
        display: "flex",
        flexDirection: "column",
        position: "relative",
        boxShadow: focused ? "inset 2px 0 0 var(--acc)" : "none",
        transition: "box-shadow 0.18s ease",
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
      }}
    >
      <div className="sf-hd">
        <span className="sf-hd-title" style={{ color: focused ? "var(--acc)" : undefined }}>
          <span className="acc">◈</span>
          {t("inputTitle")}
        </span>
        <span className="sf-meta">{filesMeta}</span>
      </div>

      <textarea
        value={rawInput}
        onChange={(e) => setInput(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={t("inputPlaceholder")}
        spellCheck={false}
        style={{
          flex: "1 1 auto",
          minHeight: 0,
          background: "var(--color-code)",
          color: "#d8cdb8",
          padding: "14px 16px",
          fontSize: 12.5,
          lineHeight: 1.6,
          width: "100%",
        }}
      />

      <div
        style={{
          flex: "0 0 auto",
          display: "flex",
          gap: 8,
          alignItems: "center",
          padding: "8px 12px",
          borderTop: "1px solid var(--color-b2)",
          flexWrap: "wrap",
        }}
      >
        <button className="sf-btn focus-ring" onClick={() => fileRef.current?.click()}>
          ＋ {t("addFiles")}
        </button>
        <button
          className="sf-btn focus-ring"
          onClick={() => {
            loadSample();
            pushToast("info", t("toast.sample"));
          }}
        >
          ◇ {t("sample")}
        </button>
        <button className="sf-btn focus-ring" onClick={onClear}>
          ✕ {t("clear")}
        </button>
        <span style={{ fontSize: 10, color: "var(--color-faint)", letterSpacing: ".04em" }}>
          {t("dropHint")}
        </span>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="application/json,.json,.txt"
          style={{ display: "none" }}
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {files.length > 0 && (
        <div style={{ flex: "0 0 auto", maxHeight: 110, overflowY: "auto" }}>
          {files.map((f, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                padding: "5px 12px",
                borderTop: "1px solid var(--color-b3)",
                fontSize: 11,
              }}
            >
              <span style={{ color: "var(--color-ink2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                ▪ {f.name}
              </span>
              <span style={{ display: "flex", gap: 9, alignItems: "center", flex: "0 0 auto" }}>
                <span style={{ color: "var(--color-faint)" }}>{f.size}</span>
                <button className="focus-ring" onClick={() => removeFile(i)} style={{ color: "var(--color-faint)", fontSize: 12 }} aria-label="remove file">
                  ✕
                </button>
              </span>
            </div>
          ))}
        </div>
      )}

      {dragging && (
        <div
          style={{
            position: "absolute",
            inset: 30,
            zIndex: 5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px dashed var(--acc)",
            background: "color-mix(in oklab, var(--acc) 10%, rgba(11,10,9,.82))",
            color: "var(--acc)",
            fontSize: 12,
            letterSpacing: ".18em",
            textTransform: "uppercase",
            pointerEvents: "none",
            animation: "sf-fade .14s ease both",
          }}
        >
          ⇩ {t("dropHint")}
        </div>
      )}
    </div>
  );
}
