import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Markdown } from "../Markdown";
import { GUIDE_BY_LOCALE } from "../../content/guide";

const render = (md: string) => renderToStaticMarkup(createElement(Markdown, { children: md }));

describe("Markdown renderer", () => {
  it("renders GFM tables", () => {
    const html = render("| A | B |\n| --- | --- |\n| 1 | 2 |");
    expect(html).toContain("<table");
    expect(html).toContain("<td");
  });

  it("syntax-highlights json fences with hljs token classes", () => {
    const html = render('```json\n{ "a": 1, "b": true }\n```');
    expect(html).toContain("language-json");
    expect(html).toContain("hljs");
  });

  it("styles inline code with the themed chip class", () => {
    const html = render("run `codex login` now");
    expect(html).toContain("sf-md-inline");
  });

  it("opens external links safely", () => {
    const html = render("[repo](https://github.com/x/y)");
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it("renders every real guide section in both locales without throwing", () => {
    for (const locale of ["zh", "en"] as const) {
      for (const s of GUIDE_BY_LOCALE[locale]) {
        expect(render(s.body).length).toBeGreaterThan(0);
      }
    }
  });
});
