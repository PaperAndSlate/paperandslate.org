import { expect, test } from "@playwright/test";

test.describe("public Standards Changes", () => {
  test("fails closed when the candidate API is not configured", async ({ page }) => {
    await page.goto("/standards/changes");
    await expect(page.getByRole("heading", { name: "Change history." })).toBeVisible();
    await expect(page.getByText(/change history is unavailable/i)).toBeVisible();
  });

  test("labels the candidate-only metadata boundary", async ({ page }) => {
    await page.goto("/standards/changes");
    const main = page.locator("main");
    const unavailable = page.getByText(/change history is unavailable/i);
    if (await unavailable.count()) {
      await expect(main).toContainText("Standards change history is unavailable");
    } else {
      await expect(main).toContainText("Candidate-only metadata history");
    }
    await expect(main).toContainText("no full text");
    await expect(main).toContainText("no raw bytes");
    await expect(main).not.toContainText("official wording");
  });
});
