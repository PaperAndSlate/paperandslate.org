import { expect, test } from "@playwright/test";

test.describe("public Standards API readiness", () => {
  test("fails closed when the synchronized API is unavailable", async ({ page }) => {
    await page.goto("/standards/api");
    await expect(
      page.getByRole("heading", { name: "Build against the metadata boundary." }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Developer readiness is unavailable" }),
    ).toBeVisible();
  });

  test("is discoverable from Standards", async ({ page }) => {
    await page.goto("/standards");
    await expect(page.getByRole("link", { name: "View API readiness" })).toHaveAttribute(
      "href",
      "/standards/api",
    );
  });
});
