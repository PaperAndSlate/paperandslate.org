import { expect, test } from "@playwright/test";

test("Standards API has a named main landmark and no unsafe links", async ({ page }) => {
  await page.goto("/standards/api");
  await expect(page.locator("main#main-content")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.locator('a[href^="http"]')).toHaveCount(0);
});
