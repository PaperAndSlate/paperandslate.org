import { describe, expect, it } from "vitest";
import fs from "node:fs";
describe("launch hardening", () => {
  it("has safe CSP and manifests", () => {
    const source = fs.readFileSync("apps/web/src/proxy.ts", "utf8");
    expect(source).not.toContain("unsafe-eval");
    expect(fs.existsSync("config/rollback.yml")).toBe(true);
  });
});
