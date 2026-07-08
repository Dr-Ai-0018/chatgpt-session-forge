import { useI18n } from "../lib/i18n";
import { ACCENT_HEX, useForge, type AccentId } from "../store";
import { useUi } from "../ui-store";

const ACCENTS: AccentId[] = ["amber", "green", "ice"];

export function Header() {
  const { t, locale, setLocale } = useI18n();
  const accent = useForge((s) => s.accent);
  const setAccent = useForge((s) => s.setAccent);
  const openModal = useUi((s) => s.openModal);

  return (
    <header
      style={{
        flex: "0 0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        height: 54,
        padding: "0 20px",
        borderBottom: "1px solid var(--color-b1)",
        background: "var(--color-hd)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span style={{ color: "var(--acc)", fontSize: 16, fontWeight: 600, letterSpacing: ".03em" }}>
            SESSION
          </span>
          <span style={{ color: "var(--color-ink)", fontSize: 16, letterSpacing: ".03em" }}>
            FORGE
          </span>
          <span
            className="sf-blink"
            style={{
              display: "inline-block",
              width: 8,
              height: 15,
              background: "var(--acc)",
              marginLeft: 4,
              transform: "translateY(2px)",
            }}
          />
        </div>
        <span
          className="hidden sm:inline"
          style={{
            fontSize: 9.5,
            letterSpacing: ".24em",
            color: "var(--color-faint)",
            textTransform: "uppercase",
            borderLeft: "1px solid var(--color-b1)",
            paddingLeft: 16,
          }}
        >
          {t("tagline")}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          className="sf-breathe"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "6px 13px",
            border: "1px solid color-mix(in oklab, var(--acc) 30%, transparent)",
            background: "color-mix(in oklab, var(--acc) 8%, #0b0a09)",
          }}
        >
          <span
            className="sf-pulse"
            style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--acc)" }}
          />
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.25 }}>
            <span style={{ fontSize: 10, letterSpacing: ".22em", color: "var(--acc)" }}>
              {t("offline")}
            </span>
            <span className="hidden md:inline" style={{ fontSize: 8.5, letterSpacing: ".1em", color: "var(--color-mut)" }}>
              {t("offlineSub")}
            </span>
          </div>
        </div>

        <button
          onClick={() => openModal("guide")}
          className="sf-btn focus-ring"
          style={{ padding: "6px 12px" }}
          title={t("guideTitle")}
        >
          <span className="acc" style={{ fontSize: 12 }}>?</span>
          <span className="hidden sm:inline">{t("guide")}</span>
        </button>

        <div style={{ display: "flex", gap: 5 }} title="accent">
          {ACCENTS.map((a) => (
            <button
              key={a}
              onClick={() => setAccent(a)}
              aria-label={`accent ${a}`}
              className="focus-ring"
              style={{
                width: 16,
                height: 16,
                background: ACCENT_HEX[a],
                opacity: accent === a ? 1 : 0.32,
                outline: accent === a ? "1px solid var(--color-ink)" : "none",
                outlineOffset: 2,
                transition: "opacity .16s ease",
              }}
            />
          ))}
        </div>

        <button
          onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
          className="focus-ring"
          style={{ display: "flex", border: "1px solid var(--color-b4)" }}
        >
          {(["en", "zh"] as const).map((lc, i) => (
            <span
              key={lc}
              style={{
                padding: "6px 10px",
                fontSize: 10.5,
                letterSpacing: ".1em",
                color: locale === lc ? "#0b0a09" : "var(--color-mut)",
                background: locale === lc ? "var(--acc)" : "transparent",
                borderLeft: i === 1 ? "1px solid var(--color-b4)" : "none",
              }}
            >
              {lc === "en" ? "EN" : "中"}
            </span>
          ))}
        </button>
      </div>
    </header>
  );
}
