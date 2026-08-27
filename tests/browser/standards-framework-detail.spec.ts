import { expect, test } from "@playwright/test";

test.describe("public Standards framework detail", () => {
  test("renders a release-pinned metadata-only unavailable state safely", async ({ page }) => {
    await page.goto("/standards/frameworks/iowa-mathematics");
    await expect(page.getByRole("heading", { name: "Framework detail." })).toBeVisible();
    await expect(page.getByText(/candidate projection/i)).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to Explore" })).toHaveAttribute(
      "href",
      "/standards/explore",
    );
    await expect(page.getByText(/not configured|temporarily unavailable/i)).toBeVisible();
  });
});
