import { expect, test } from "@playwright/test";

test("Standards Sources has a named main landmark and unavailable alert", async ({ page }) => {
  await page.goto("/standards/sources");
  await expect(page.locator("main#main-content")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sources are unavailable" })).toBeVisible();
  await expect(page.getByRole("status")).toBeVisible();
  await expect(
    page.getByRole("alert").filter({
      has: page.getByRole("heading", { name: "Sources are unavailable" }),
    }),
  ).toContainText(/not configured|temporarily unavailable/i);
});
