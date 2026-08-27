import { expect, test } from "@playwright/test";

test("Standards source detail has landmarks, headings, and navigation", async ({ page }) => {
  await page.goto("/standards/sources/source-iowa-mathematics-research");
  await expect(page.locator("main#main-content")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Source detail." })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Standards navigation" })).toBeVisible();
  if (process.env.STANDARDS_API_URL && process.env.LOCAL_API_BEARER) {
    await expect(page.getByRole("heading", { name: "Source metadata" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Rights and availability" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Provenance" })).toBeVisible();
  } else {
    await expect(page.locator("main#main-content").getByRole("alert")).toContainText(
      /not configured|temporarily unavailable/i,
    );
  }
});
