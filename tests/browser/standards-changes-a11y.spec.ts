import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("Standards Changes has no critical automated accessibility violations", async ({ page }) => {
  await page.goto("/standards/changes");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => violation.impact === "critical")).toEqual([]);
});
