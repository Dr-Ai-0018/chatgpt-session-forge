import { useEffect, useMemo, useRef, useState } from "react";
import { Modal } from "./Modal";
import { Markdown } from "./Markdown";
import { GUIDE_SECTIONS, type GuideSection } from "../content/guide";
import { useUi } from "../ui-store";
import { useI18n } from "../lib/i18n";
import { useMediaQuery } from "../lib/useMediaQuery";

/** Tabbed, markdown-rendered setup guide — one tab per downstream channel + how-to + notes. */
export function GuideModal() {
  const { t } = useI18n();
  const closeModal = useUi((s) => s.closeModal);
  const wide = useMediaQuery("(min-width: 900px)");

  const [activeId, setActiveId] = useState(GUIDE_SECTIONS[0]?.id ?? "");
  const idx = Math.max(0, GUIDE_SECTIONS.findIndex((s) => s.id === activeId));
  const section = GUIDE_SECTIONS[idx] ?? GUIDE_SECTIONS[0];

  const groups = useMemo(
    () => ({
      guide: GUIDE_SECTIONS.filter((s) => s.group === "guide"),
      channel: GUIDE_SECTIONS.filter((s) => s.group === "channel"),
    }),
    [],
  );

  // reset scroll to top whenever the active tab changes
  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [activeId]);

  const NavItem = ({ s }: { s: GuideSection }) => {
    const on = s.id === activeId;
    return (
      <button
        onClick={() => setActiveId(s.id)}
        className="focus-ring sf-guide-tab"
        style={{
          textAlign: "left",
          whiteSpace: "nowrap",
          padding: wide ? "7px 12px" : "6px 12px",
          fontSize: 12,
          letterSpacing: ".02em",
          color: on ? "var(--acc)" : "var(--color-ink2)",
          background: on ? "color-mix(in oklab, var(--acc) 12%, transparent)" : "transparent",
          borderLeft: wide ? `2px solid ${on ? "var(--acc)" : "transparent"}` : "none",
          borderBottom: wide ? "none" : `2px solid ${on ? "var(--acc)" : "transparent"}`,
        }}
      >
        {s.label}
      </button>
    );
  };

  const GroupLabel = ({ text }: { text: string }) => (
    <div
      style={{
        padding: "10px 12px 5px",
        fontSize: 9.5,
        letterSpacing: ".2em",
        textTransform: "uppercase",
        color: "var(--color-faint)",
      }}
    >
      {text}
    </div>
  );

  const content = (
    <div ref={bodyRef} style={{ flex: "1 1 auto", minHeight: 0, overflow: "auto", padding: wide ? "6px 26px 30px" : "4px 16px 26px" }}>
      <Markdown>{section.body}</Markdown>
    </div>
  );

  return (
    <Modal
      title={t("guideTitle")}
      onClose={closeModal}
      size="full"
      meta={<span className="sf-meta">{t("guideMeta")}</span>}
      footer={
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <span className="sf-meta">
            {idx + 1} / {GUIDE_SECTIONS.length}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="sf-btn focus-ring"
              disabled={idx === 0}
              onClick={() => setActiveId(GUIDE_SECTIONS[idx - 1].id)}
            >
              ← {t("guidePrev")}
            </button>
            <button
              className="sf-btn focus-ring"
              disabled={idx >= GUIDE_SECTIONS.length - 1}
              onClick={() => setActiveId(GUIDE_SECTIONS[idx + 1].id)}
            >
              {t("guideNext")} →
            </button>
          </div>
        </div>
      }
    >
      {wide ? (
        <div style={{ flex: "1 1 auto", minHeight: 0, display: "flex", flexDirection: "row" }}>
          <nav
            style={{
              flex: "0 0 186px",
              minHeight: 0,
              overflow: "auto",
              borderRight: "1px solid var(--color-b2)",
              background: "var(--color-b3)",
              paddingBottom: 12,
            }}
          >
            <GroupLabel text={t("guideBasics")} />
            {groups.guide.map((s) => (
              <NavItem key={s.id} s={s} />
            ))}
            <GroupLabel text={t("guideChannels")} />
            {groups.channel.map((s) => (
              <NavItem key={s.id} s={s} />
            ))}
          </nav>
          {content}
        </div>
      ) : (
        <div style={{ flex: "1 1 auto", minHeight: 0, display: "flex", flexDirection: "column" }}>
          <div
            className="sf-chipbar"
            style={{
              flex: "0 0 auto",
              display: "flex",
              gap: 2,
              overflowX: "auto",
              borderBottom: "1px solid var(--color-b2)",
              background: "var(--color-b3)",
            }}
          >
            {GUIDE_SECTIONS.map((s) => (
              <NavItem key={s.id} s={s} />
            ))}
          </div>
          {content}
        </div>
      )}
    </Modal>
  );
}
