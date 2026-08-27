import { expect, test } from "@playwright/test";

const release = "candidate-ia-mathematics-fixture-2026";

test.describe("public Standards source detail", () => {
  test("fails closed when the synchronized API is not configured", async ({ page }) => {
    test.skip(
      Boolean(process.env.STANDARDS_API_URL),
      "requires an unavailable Standards API environment",
    );
    await page.goto("/standards/sources/source-iowa-mathematics-research");
    await expect(page.getByRole("heading", { name: "Source detail." })).toBeVisible();
    await expect(page.locator("main").getByRole("alert")).toContainText(
      /not configured|temporarily unavailable/i,
    );
    await expect(page.locator("main")).not.toContainText("LOCAL_API_BEARER");
  });

  test("shows the exact candidate source projection and safe limits", async ({ page }) => {
    test.skip(
      !process.env.STANDARDS_API_URL || !process.env.LOCAL_API_BEARER,
      "requires STANDARDS_API_URL and LOCAL_API_BEARER for the authenticated Standards API projection",
    );
    await page.goto(`/standards/sources/source-iowa-mathematics-research?release=${release}`);
    await expect(page.getByRole("heading", { name: "Source detail." })).toBeVisible();
    await expect(page.locator("main")).toContainText("source-iowa-mathematics-research");
    await expect(page.locator("main")).toContainText(release);
    await expect(page.locator("main")).toContainText(/fixture-only/i);
    await expect(page.locator("main")).toContainText("metadata only");
    await expect(page.locator("main")).toContainText("Rights and availability");
    await expect(page.locator("main")).toContainText("Provenance");
    await expect(page.locator("main")).not.toContainText("rawBytes");
    await expect(page.locator('a[target="_blank"]')).toHaveAttribute("href", /^https?:\/\//);
    await expect(page.locator("main")).not.toContainText("LOCAL_API_BEARER");
  });
});
