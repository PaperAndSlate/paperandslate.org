import { expect, test } from "@playwright/test";

test("item detail has a named main landmark and keyboard navigation", async ({ page }) => {
  await page.goto(
    "/standards/items/node-ia-math-k5-numeric-1?release=candidate-ia-mathematics-fixture-2026",
  );
  await expect(page.locator("main#main-content")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Standards navigation" })).toBeVisible();
  if (process.env.STANDARDS_API_URL && process.env.LOCAL_API_BEARER) {
    await expect(
      page.getByText("Release candidate-ia-mathematics-fixture-2026").first(),
    ).toBeVisible();
    await expect(page.getByText("Candidate preview.")).toBeVisible();
  } else {
    await expect(page.getByText(/not configured|temporarily unavailable/i)).toBeVisible();
  }
  const back = page.getByRole("link", { name: "Back to Explore" });
  await back.focus();
  await expect(back).toBeFocused();
});
