import { expect, test } from "@playwright/test";

test("Standards concepts has a named main landmark and safe readiness headings", async ({
  page,
}) => {
  await page.goto("/standards/concepts");
  await expect(page.locator("main#main-content")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 2 })).toHaveCount(2);
  await expect(page.getByRole("status")).toContainText("candidate preview");
  await expect(page.locator("main#main-content")).toContainText("Rights status: denied");
});
