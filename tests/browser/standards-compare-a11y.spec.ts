import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("Standards Compare has no critical automated accessibility violations", async ({ page }) => {
  await page.goto("/standards/compare");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => violation.impact === "critical")).toEqual([]);
});
