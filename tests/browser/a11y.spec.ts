import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("central docs have named controls and no serious accessibility violations", async ({
  page,
}) => {
  await page.goto("/docs/paper-and-slate/next/concepts/provenance");
  expect(
    await page
      .locator("button, a")
      .evaluateAll((items) =>
        items.every((item) => (item.textContent ?? "").trim() || item.getAttribute("aria-label")),
      ),
  ).toBe(true);
  const results = await new AxeBuilder({ page }).analyze();
  expect(
    results.violations.filter(({ impact }) => impact === "serious" || impact === "critical"),
  ).toEqual([]);
});
