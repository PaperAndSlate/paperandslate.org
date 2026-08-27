import { expect, test } from "@playwright/test";

test("Standards Explorer has a named main landmark and keyboard form controls", async ({
  page,
}) => {
  await page.goto("/standards/explore");
  await expect(page.locator("main#main-content")).toBeVisible();
  const searchForm = page.getByRole("form", { name: "Search and filter standards" });
  await expect(searchForm).toBeVisible();
  await expect(searchForm.getByRole("button", { name: "Search" })).toBeEnabled();
});
