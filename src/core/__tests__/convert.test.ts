import { beforeAll, afterAll, describe, expect, it, vi } from "vitest";
import {
  convertAccounts,
  parseSources,
  type NormalizedAccount,
  type Source,
  type TargetId,
} from "..";
import { DEMO_INPUT } from "../constants";

// Freeze the clock so lastRefresh / expires_in / synthetic exp are deterministic.
const FIXED = new Date("2025-06-01T00:00:00.000Z");

beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FIXED);
});
afterAll(() => {
  vi.useRealTimers();
});

const TARGETS: TargetId[] = [
  "sub2api",
  "cpa",
  "cockpit",
  "9router",
  "codex",
  "axonhub",
  "codex-manager",
];

function demoSources(): Source[] {
  return [{ name: "demo.json", text: JSON.stringify(DEMO_INPUT) }];
}

describe("parseSources", () => {
  it("extracts the two token-bearing accounts and skips the identity-only one", () => {
    const result = parseSources(demoSources(), FIXED.getTime());
    expect(result.accounts).toHaveLength(2);
    expect(result.accounts.map((a) => a.email)).toEqual([
      "demo@example.com",
      "codex@example.com",
    ]);
    // The third demo entry has no token -> skipped.
    expect(result.skipped.some((s) => s.reason.includes("缺少"))).toBe(true);
  });

  it("dedupes identical accounts across sources", () => {
    const twice: Source[] = [
      { name: "a.json", text: JSON.stringify(DEMO_INPUT) },
      { name: "b.json", text: JSON.stringify(DEMO_INPUT) },
    ];
    const result = parseSources(twice, FIXED.getTime());
    expect(result.accounts).toHaveLength(2);
    expect(result.skipped.some((s) => s.reason.includes("重复"))).toBe(true);
  });

  it("reports invalid JSON as a skipped source", () => {
    const result = parseSources([{ name: "bad.json", text: "{not json" }], FIXED.getTime());
    expect(result.accounts).toHaveLength(0);
    expect(result.skipped[0].reason).toContain("JSON 解析失败");
  });
});

describe("converters", () => {
  const accounts: NormalizedAccount[] = parseSources(demoSources(), FIXED.getTime()).accounts;

  it.each(TARGETS)("produces stable output for %s", (target) => {
    const output = convertAccounts(accounts, target, FIXED.getTime());
    expect(output).toMatchSnapshot();
  });

  it("sub2api wraps accounts in an export envelope", () => {
    const output = convertAccounts(accounts, "sub2api", FIXED.getTime()) as Record<string, unknown>;
    expect(output).toHaveProperty("exported_at");
    expect(output).toHaveProperty("proxies", []);
    expect(Array.isArray(output.accounts)).toBe(true);
  });

  it("single-account targets return an object, not an array", () => {
    const one = [accounts[0]];
    const output = convertAccounts(one, "cpa", FIXED.getTime());
    expect(Array.isArray(output)).toBe(false);
  });
});

describe("jwt-derived fields", () => {
  it("synthesizes an id_token when account id is known but id_token is absent", () => {
    const src: Source[] = [
      {
        name: "s.json",
        text: JSON.stringify({
          accessToken: "a.b.c",
          chatgpt_account_id: "acc-123",
          plan_type: "plus",
          email: "who@example.com",
        }),
      },
    ];
    const [account] = parseSources(src, FIXED.getTime()).accounts;
    expect(account.idTokenSynthetic).toBe(true);
    expect(account.effectiveIdToken).toMatch(/\.synthetic$/);
  });
});
