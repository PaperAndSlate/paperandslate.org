import { expect, test } from "@playwright/test";

test("Standards Coverage has a named main landmark and unavailable alert", async ({ page }) => {
  await page.goto("/standards/coverage");

  await expect(page.locator("main#main-content")).toBeVisible();
  await expect(page.getByRole("heading", { name: "What this release contains" })).toBeVisible();
  await expect(page.getByRole("status")).toBeVisible();
  await expect(
    page.getByRole("alert").filter({
      has: page.getByRole("heading", { name: "Coverage is unavailable" }),
    }),
  ).toContainText(/not configured|temporarily unavailable/i);
});
