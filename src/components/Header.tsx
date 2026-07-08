import { useI18n } from "../lib/i18n";
import { ACCENT_HEX, useForge, type AccentId } from "../store";
import { useUi } from "../ui-store";

const ACCENTS: AccentId[] = ["amber", "green", "ice"];
const REPO_URL = "https://github.com/Dr-Ai-0018/chatgpt-session-forge";

function GithubMark() {
  return (
    <svg viewBox="0 0 16 16" width="15" height="15" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

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

        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="sf-btn focus-ring"
          style={{ padding: "6px 10px", textDecoration: "none" }}
          title="GitHub"
          aria-label="GitHub repository"
        >
          <GithubMark />
        </a>

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
