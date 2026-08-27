import { expect, test } from "@playwright/test";

test.describe("public Standards Explorer", () => {
  test("renders the landing entry point", async ({ page }) => {
    await page.goto("/standards");
    await expect(
      page.getByRole("heading", { name: "Open standards. Clearer understanding." }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Explore standards" })).toHaveAttribute(
      "href",
      "/standards/explore",
    );
  });

  test("keeps search filters addressable", async ({ page }) => {
    await page.goto(
      "/standards/explore?q=compound&jurisdiction=IA&stage=7&subject=mathematics&release=standards-2026.08.0-preview",
    );
    await expect(
      page.getByRole("heading", { name: "Search the standards catalog." }),
    ).toBeVisible();
    await expect(page.getByLabel(/Search standards/)).toHaveValue("compound");
    await expect(page.getByText("Release: standards-2026.08.0-preview")).toBeVisible();
  });
});
