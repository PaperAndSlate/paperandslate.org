import { expect, test } from "@playwright/test";

test.describe("public Standards Compare", () => {
  test("renders a candidate-only, fail-closed comparison surface", async ({ page }) => {
    await page.goto(
      "/standards/compare?left_release=candidate-iowa&right_release=candidate-england",
    );
    await expect(
      page.getByRole("heading", { name: "Compare structure, keep the limits visible." }),
    ).toBeVisible();
    await expect(page.getByRole("status")).toContainText("candidate-iowa");
    await expect(page.getByRole("status")).toContainText("candidate-england");
    await expect(page.getByRole("status")).toContainText("Not a stable or current publication");
    await expect(page.getByText(/not configured|temporarily unavailable/i)).toBeVisible();
    await expect(page.locator("main")).not.toContainText("equivalence percentage");
    await expect(page.locator("main")).not.toContainText("officialBytes");
  });

  test("is discoverable from the Standards landing page", async ({ page }) => {
    await page.goto("/standards");
    await expect(page.getByRole("link", { name: "Compare releases" })).toHaveAttribute(
      "href",
      "/standards/compare",
    );
  });
});
