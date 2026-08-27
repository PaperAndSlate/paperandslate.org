import { expect, test } from "@playwright/test";

test("framework detail has a named main landmark and keyboard navigation", async ({ page }) => {
  await page.goto("/standards/frameworks/iowa-mathematics");
  await expect(page.locator("main#main-content")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Standards navigation" })).toBeVisible();
  const back = page.getByRole("link", { name: "Back to Explore" });
  await back.focus();
  await expect(back).toBeFocused();
});
