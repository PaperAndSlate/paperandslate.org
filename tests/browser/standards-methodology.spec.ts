import { expect, test } from "@playwright/test";

test.describe("public Standards Methodology and Trust", () => {
  test("renders the policy and current fixture boundary", async ({ page }) => {
    await page.goto("/standards/methodology");

    await expect(
      page.getByRole("heading", { name: "How Slate & Paper Standards works." }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Keep source material and interpretation distinct." }),
    ).toBeVisible();
    await expect(
      page.getByText("synthetic, candidate-only, non-public, and rights-denied metadata examples"),
    ).toBeVisible();
    await expect(page.getByText("They are not official or stable publications")).toBeVisible();
    await expect(page.locator("main#main-content")).toContainText("official wording");
    await expect(page.locator("main#main-content")).toContainText("source bytes");
    await expect(page.locator("main#main-content")).toContainText("full text");
    await expect(page.locator("main#main-content")).toContainText("downloads");
  });

  test("is discoverable from Standards", async ({ page }) => {
    await page.goto("/standards");
    await expect(page.getByRole("link", { name: "Read the methodology" })).toHaveAttribute(
      "href",
      "/standards/methodology",
    );
  });
});
