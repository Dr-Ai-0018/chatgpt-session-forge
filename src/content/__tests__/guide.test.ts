import { describe, it, expect } from "vitest";
import { GUIDE_SECTIONS } from "../guide";

describe("guide content parsing", () => {
  it("parses all nine sections in order", () => {
    expect(GUIDE_SECTIONS.map((s) => s.id)).toEqual([
      "start",
      "sub2api",
      "cpa",
      "cockpit",
      "9router",
      "codex",
      "axonhub",
      "codex-manager",
      "notes",
    ]);
  });

  it("splits two guide sections and seven channels", () => {
    expect(GUIDE_SECTIONS.filter((s) => s.group === "guide").map((s) => s.id)).toEqual([
      "start",
      "notes",
    ]);
    expect(GUIDE_SECTIONS.filter((s) => s.group === "channel")).toHaveLength(7);
  });

  it("gives every section a label and substantive body", () => {
    for (const s of GUIDE_SECTIONS) {
      expect(s.label.trim().length).toBeGreaterThan(0);
      expect(s.body.length).toBeGreaterThan(40);
    }
  });

  it("does not leak section markers into bodies", () => {
    for (const s of GUIDE_SECTIONS) {
      expect(s.body).not.toContain("<!--SECTION");
    }
  });
});
