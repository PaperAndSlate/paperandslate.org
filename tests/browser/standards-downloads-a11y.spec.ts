import { expect, test } from "@playwright/test";

test("Standards downloads has a named main landmark and safe state", async ({ page }) => {
  await page.goto("/standards/downloads");
  await expect(page.locator("main#main-content")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 2 })).toHaveCount(1);
});
