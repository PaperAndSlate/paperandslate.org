import { describe, expect, it } from "vitest";
import {
  createFallbackSearchProvider,
  createStaticSearchProvider,
  normalizeRecords,
  rankRecords,
  type SearchProvider,
} from "../packages/search/src";
const r = {
  id: "rfc:1",
  title: "RFC 1: Stable identifiers",
  summary: "identifiers",
  route: "/governance/rfcs/1",
  type: "rfc" as const,
  source: "governance" as const,
  aliases: ["rfc 1", "rfc:1", "1"],
};
describe("unified search", () => {
  it("ranks exact RFC records and bounds results", () => {
    expect(rankRecords([r], "rfc 1")[0]?.id).toBe("rfc:1");
    expect(
      rankRecords(
        Array.from({ length: 30 }, (_, i) => ({
          ...r,
          id: `rfc:${i}`,
          title: `RFC ${i}`,
          aliases: [`rfc ${i}`],
        })),
        "rfc",
      ).length,
    ).toBeLessThanOrEqual(20);
  });
  it("validates records and isolates preview records", async () => {
    const provider = createStaticSearchProvider(
      normalizeRecords([
        { ...r, visibility: "preview" },
        { ...r, id: "public", title: "Public record" },
      ]),
    );
    expect((await provider.search("record")).results.map((x) => x.id)).toEqual(["public"]);
  });
  it("returns no results for blank or unknown queries", () => {
    expect(rankRecords([], " ")).toEqual([]);
    expect(rankRecords([r], "unknown")).toEqual([]);
  });
  it("falls back to the static index when the hosted provider is unavailable", async () => {
    const primary: SearchProvider = {
      mode: "typesense",
      search: async () => {
        throw new Error("provider unavailable");
      },
    };
    const fallback = createStaticSearchProvider(normalizeRecords([r]));
    const response = await createFallbackSearchProvider(primary, fallback).search("RFC 1");
    expect(response.provider).toBe("static-fallback");
    expect(response.degraded).toBe(true);
    expect(response.results[0]?.id).toBe("rfc:1");
  });
});
