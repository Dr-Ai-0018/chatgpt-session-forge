import { describe, it, expect } from "vitest";
import { GUIDE_SECTIONS, GUIDE_BY_LOCALE, getGuideSections } from "../guide";

const EXPECTED_IDS = [
  "start",
  "sub2api",
  "cpa",
  "cockpit",
  "9router",
  "codex",
  "axonhub",
  "codex-manager",
  "notes",
];

describe("guide content parsing", () => {
  it("parses the default (zh) sections in order", () => {
    expect(GUIDE_SECTIONS.map((s) => s.id)).toEqual(EXPECTED_IDS);
  });

  it("parses both locales to the same section ids and grouping", () => {
    for (const locale of ["zh", "en"] as const) {
      const sections = GUIDE_BY_LOCALE[locale];
      expect(sections.map((s) => s.id)).toEqual(EXPECTED_IDS);
      expect(sections.filter((s) => s.group === "guide").map((s) => s.id)).toEqual([
        "start",
        "notes",
      ]);
      expect(sections.filter((s) => s.group === "channel")).toHaveLength(7);
    }
  });

  it("gives every section a label and substantive body in both locales", () => {
    for (const locale of ["zh", "en"] as const) {
      for (const s of GUIDE_BY_LOCALE[locale]) {
        expect(s.label.trim().length).toBeGreaterThan(0);
        expect(s.body.length).toBeGreaterThan(40);
        expect(s.body).not.toContain("<!--SECTION");
      }
    }
  });

  it("falls back to zh for an unknown locale", () => {
    expect(getGuideSections("fr")).toBe(GUIDE_BY_LOCALE.zh);
    expect(getGuideSections("en")).toBe(GUIDE_BY_LOCALE.en);
  });
});
