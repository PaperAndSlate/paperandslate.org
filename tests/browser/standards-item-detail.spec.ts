import { expect, test } from "@playwright/test";

test.describe("public Standards item detail", () => {
  test("renders truthful candidate metadata or the unavailable state safely", async ({ page }) => {
    const configured = Boolean(process.env.STANDARDS_API_URL && process.env.STANDARDS_API_BEARER);
    await page.goto(
      "/standards/items/node-ia-math-k5-numeric-1?release=candidate-ia-mathematics-fixture-2026",
    );
    await expect(page.getByRole("link", { name: "Back to Explore" })).toHaveAttribute(
      "href",
      "/standards/explore",
    );
    if (!configured) {
      await expect(page.getByRole("heading", { name: "Standards item detail." })).toBeVisible();
      await expect(page.getByText(/not configured|temporarily unavailable/i)).toBeVisible();
      return;
    }

    await expect(page.getByRole("heading", { name: "K5.N.1" })).toBeVisible();
    await expect(
      page.getByText("Release candidate-ia-mathematics-fixture-2026").first(),
    ).toBeVisible();
    await expect(page.getByText("Candidate preview.")).toBeVisible();
    await expect(
      page.getByText("Metadata only: official wording is not returned by this release."),
    ).toBeVisible();
    await expect(
      page.getByRole("region", { name: "Trust, rights, and availability" }),
    ).toContainText("Raw bytesUnavailable");
    await expect(page.locator("body")).not.toContainText(/ps_test|Bearer /);
    for (const link of await page.locator('a[target="_blank"]').all()) {
      await expect(link).toHaveAttribute("href", /^(https?):/);
    }
    for (const link of await page.locator('a[href^="/standards/items/"]').all()) {
      await expect(link).toHaveAttribute(
        "href",
        /[?&]release=candidate-ia-mathematics-fixture-2026$/,
      );
    }
  });
});
