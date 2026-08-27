import { test, expect } from "@playwright/test";
test("homepage visual baseline — light desktop", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".theme-control")).toHaveAttribute("data-theme-mounted", "true");
  await expect(page).toHaveScreenshot("homepage.png", { animations: "disabled" });
});

test("homepage visual baseline — 390px mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator(".mobile-menu")).toBeVisible();
  await expect(page.locator(".theme-control")).toHaveAttribute("data-theme-mounted", "true");
  await expect(page.locator("body")).toHaveScreenshot("homepage-mobile.png", {
    animations: "disabled",
  });
});

test("homepage visual baseline — dark mode", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await expect(page.locator(".theme-control")).toHaveAttribute("data-theme-mounted", "true");
  await expect(page).toHaveScreenshot("homepage-dark.png", {
    animations: "disabled",
  });
});
