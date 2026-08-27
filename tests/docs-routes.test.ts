import { describe, expect, it } from "vitest";
import { docs } from "../apps/web/src/lib/docs";
import fs from "node:fs";
describe("static docs route model", () => {
  it("has visible source and version metadata", () => {
    expect(docs.length).toBeGreaterThan(0);
    expect(docs.every((doc) => doc.version && doc.ref && /^[a-f0-9]{64}$/.test(doc.hash))).toBe(
      true,
    );
  });
  it("keeps historical routes distinct", () => {
    const historical = docs.find((doc) => doc.id === "file-system:v1:index");
    expect(historical?.route).toBe("/docs/file-system/v/1.0");
    expect(historical?.aliases).toContain("/docs/file-system/v1");
    expect(docs.some((doc) => doc.route.includes("/next/"))).toBe(true);
  });
});
describe("docs taxonomy route contract", () => {
  it("declares every catalog landing", () => {
    for (const section of [
      "getting-started",
      "concepts",
      "guides",
      "reference",
      "tools",
      "governance",
    ])
      expect(fs.existsSync(`apps/web/src/app/(docs)/docs/${section}/page.tsx`)).toBe(true);
  });
});
