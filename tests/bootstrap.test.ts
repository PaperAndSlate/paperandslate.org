import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Phase 0 bootstrap", () => {
  it("keeps the root route branded and infrastructure-free", () => {
    const page = readFileSync(resolve(process.cwd(), "apps/web/src/app/page.tsx"), "utf8");
    expect(page).toContain("Paper &amp; Slate");
    expect(page).not.toMatch(/next-auth|prisma|drizzle-orm|postgres/i);
  });
});
