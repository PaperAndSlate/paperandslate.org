import { expect, test } from "@playwright/test";

test("Standards Methodology has a named main landmark and semantic sections", async ({ page }) => {
  await page.goto("/standards/methodology");

  await expect(page.locator("main#main-content")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 2 })).toHaveCount(5);
  await expect(page.locator("aside[aria-label='Current Standards fixture status']")).toBeVisible();
  await expect(page.getByRole("link", { name: "Review source records" })).toBeVisible();
});
