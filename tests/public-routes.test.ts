import { describe, expect, it } from "vitest";
import fs from "node:fs";
describe("public route contract", () => {
  it("includes utility, report, release, and machine-readable routes", () => {
    for (const file of [
      "apps/web/src/app/not-found.tsx",
      "apps/web/src/app/error.tsx",
      "apps/web/src/app/projects.json/route.ts",
      "apps/web/src/app/(public)/foundation/reports/[year]/page.tsx",
      "apps/web/src/app/(public)/projects/[slug]/releases/page.tsx",
      "apps/web/src/app/(public)/privacy/page.tsx",
      "apps/web/src/app/(public)/terms/page.tsx",
    ])
      expect(fs.existsSync(file)).toBe(true);
  });
  it("includes route-catalog news and governance entrypoints", () => {
    for (const file of [
      "apps/web/src/app/(public)/news/category/[category]/page.tsx",
      "apps/web/src/app/(public)/news/tag/[tag]/page.tsx",
      "apps/web/src/app/(public)/governance/contributing/page.tsx",
      "apps/web/src/app/(public)/governance/code-of-conduct/page.tsx",
      "apps/web/src/app/(public)/governance/security/page.tsx",
      "apps/web/src/app/(public)/governance/conflicts/page.tsx",
      "apps/web/src/app/(public)/governance/trademarks/page.tsx",
      "apps/web/src/app/(public)/governance/licenses/page.tsx",
    ])
      expect(fs.existsSync(file)).toBe(true);
  });
});
