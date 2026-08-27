import { expect, test } from "@playwright/test";

test.describe("public Standards Coverage", () => {
  test("fails closed when the synchronized API is not configured", async ({ page }) => {
    await page.goto("/standards/coverage");

    await expect(
      page.getByRole("heading", { name: "See what the release actually covers." }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Coverage is unavailable" })).toBeVisible();
    await expect(
      page.getByText("The synchronized Standards API is not configured in this environment."),
    ).toBeVisible();
  });

  test("identifies the pinned candidate preview without implying publication", async ({ page }) => {
    await page.goto("/standards/coverage");

    const notice = page.getByRole("status");
    await expect(notice).toContainText("Release: standards-2026.08.0-preview");
    await expect(notice).toContainText("candidate preview");
    await expect(notice).toContainText("not a stable or current publication");
    await expect(notice).not.toContainText("candidate candidate");
  });
});
