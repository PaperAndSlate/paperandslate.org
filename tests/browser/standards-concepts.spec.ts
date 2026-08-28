import { expect, test } from "@playwright/test";

test.describe("public Standards concepts and crosswalks", () => {
  test("fails closed when the synchronized API is unavailable", async ({ page }) => {
    await page.goto("/standards/concepts");
    await expect(
      page.getByRole("heading", { name: "What has been reviewed across standards?" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Concepts and crosswalks are unavailable" }),
    ).toBeVisible();
    await expect(
      page.getByText("The synchronized Standards API is not configured in this environment."),
    ).toBeVisible();
  });

  test("is discoverable from Standards", async ({ page }) => {
    await page.goto("/standards");
    await expect(page.getByRole("link", { name: "View concepts and crosswalks" })).toHaveAttribute(
      "href",
      "/standards/concepts",
    );
  });
});
