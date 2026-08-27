import { expect, test } from "@playwright/test";

test.describe("release-candidate visual evidence", () => {
  test("homepage light desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.goto("/");
    await expect(page).toHaveScreenshot("rc-home-light-desktop.png", {
      animations: "disabled",
      caret: "hide",
      fullPage: true,
    });
  });

  test("homepage dark desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.goto("/");
    await page.getByLabel("Color theme").selectOption("dark");
    await expect(page).toHaveScreenshot("rc-home-dark-desktop.png", {
      animations: "disabled",
      caret: "hide",
      fullPage: true,
    });
  });

  test("homepage mobile with navigation closed", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page).toHaveScreenshot("rc-home-mobile.png", {
      animations: "disabled",
      caret: "hide",
      fullPage: true,
    });
  });

  test("projects registry controls", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.goto("/projects");
    await expect(page).toHaveScreenshot("rc-projects-registry.png", {
      animations: "disabled",
      caret: "hide",
      fullPage: true,
    });
  });

  test("documentation detail", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.goto("/docs/paper-and-slate/next/concepts/provenance");
    await expect(page).toHaveScreenshot("rc-docs-detail.png", {
      animations: "disabled",
      caret: "hide",
      fullPage: true,
    });
  });

  test("global search overlay", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.goto("/");
    await page.getByRole("button", { name: "Open search" }).click();
    await page.getByRole("dialog").getByRole("textbox").fill("RFC 1");
    await expect(page).toHaveScreenshot("rc-search-overlay.png", {
      animations: "disabled",
      caret: "hide",
      fullPage: true,
    });
  });
});
