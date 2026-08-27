import { test, expect } from "@playwright/test";
test("central docs expose navigation, provenance, TOC, and raw action", async ({ page }) => {
  await page.goto("/docs/paper-and-slate/next/concepts/provenance");
  await expect(page.getByRole("navigation", { name: "Documentation taxonomy" })).toBeVisible();
  await expect(page.getByRole("complementary", { name: "Source provenance" })).toBeVisible();
  await expect(page.getByRole("complementary", { name: "On this page" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Raw Markdown/ })).toHaveAttribute(
    "href",
    /\/docs\/raw\//,
  );
});
