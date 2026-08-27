import { expect, test } from "@playwright/test";

test.describe("public Standards Sources", () => {
  test("fails closed when the synchronized API is not configured", async ({ page }) => {
    await page.goto("/standards/sources");
    await expect(
      page.getByRole("heading", { name: "Know where the standards come from." }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Sources are unavailable" })).toBeVisible();
    await expect(
      page.getByRole("alert").filter({
        has: page.getByRole("heading", { name: "Sources are unavailable" }),
      }),
    ).toContainText("not configured");
  });

  test("labels the pinned candidate preview and metadata-only boundary", async ({ page }) => {
    await page.goto("/standards/sources");
    await expect(page.getByRole("status")).toContainText("standards-2026.08.0-preview");
    await expect(page.getByRole("status")).toContainText("candidate preview");
    await expect(page.getByRole("status")).toContainText("not a stable or current publication");
    await expect(page.locator("main")).toContainText("metadata only");
    await expect(page.locator("main")).not.toContainText("rawBytes");
  });
});
