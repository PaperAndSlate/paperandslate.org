import { describe, expect, it } from "vitest";
import fs from "node:fs";
import YAML from "yaml";
describe("redirect registry", () => {
  it("has no self redirects or duplicate sources", () => {
    const redirects = YAML.parse(fs.readFileSync("config/redirects.yml", "utf8")).redirects as {
      from: string;
      to: string;
    }[];
    expect(new Set(redirects.map((r) => r.from)).size).toBe(redirects.length);
    expect(redirects.every((r) => r.from !== r.to)).toBe(true);
  });
});
