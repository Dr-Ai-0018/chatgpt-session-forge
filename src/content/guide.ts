import rawZh from "./guide.zh.md?raw";
import rawEn from "./guide.en.md?raw";

export type GuideGroup = "guide" | "channel";
export type GuideLocale = "zh" | "en";

export interface GuideSection {
  id: string;
  label: string;
  group: GuideGroup;
  body: string;
}

const SECTION_RE = /<!--SECTION\s+id=([\w-]+)\s+label=(\S+)\s+group=(guide|channel)\s*-->/g;

/** Split a section-marked markdown doc into per-tab sections. */
function parseGuide(raw: string): GuideSection[] {
  const marks = [...raw.matchAll(SECTION_RE)];
  return marks.map((m, i) => {
    const start = (m.index ?? 0) + m[0].length;
    const end = i + 1 < marks.length ? (marks[i + 1].index ?? raw.length) : raw.length;
    return {
      id: m[1],
      label: m[2],
      group: m[3] as GuideGroup,
      body: raw.slice(start, end).trim(),
    };
  });
}

export const GUIDE_BY_LOCALE: Record<GuideLocale, GuideSection[]> = {
  zh: parseGuide(rawZh),
  en: parseGuide(rawEn),
};

/** Sections for a locale, falling back to Chinese. */
export function getGuideSections(locale: string): GuideSection[] {
  return GUIDE_BY_LOCALE[locale as GuideLocale] ?? GUIDE_BY_LOCALE.zh;
}

/** Default (zh) sections — kept for tests and non-localized callers. */
export const GUIDE_SECTIONS: GuideSection[] = GUIDE_BY_LOCALE.zh;
