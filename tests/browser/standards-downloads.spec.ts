import { expect, test } from "@playwright/test";

test.describe("public Standards downloads", () => {
  test("fails closed when the synchronized API is unavailable", async ({ page }) => {
    await page.goto("/standards/downloads");
    await expect(
      page.getByRole("heading", { name: "Download readiness, with the limits visible." }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Downloads are unavailable" })).toBeVisible();
    await expect(
      page.getByText("The synchronized Standards API is not configured in this environment."),
    ).toBeVisible();
  });

  test("is discoverable from Standards", async ({ page }) => {
    await page.goto("/standards");
    await expect(page.getByRole("link", { name: "Review downloads" })).toHaveAttribute(
      "href",
      "/standards/downloads",
    );
  });
});
