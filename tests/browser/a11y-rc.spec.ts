import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/foundation/mission",
  "/projects",
  "/projects/file-system",
  "/docs",
  "/docs/paper-and-slate",
  "/docs/file-system",
  "/docs/file-system/v/1.0/reference/metadata",
  "/docs/well-known-discovery",
  "/docs/organization-schema",
  "/docs/curriculum-standards-schema",
  "/docs/course-catalog-schema",
  "/docs/tools-and-libraries",
  "/docs/paper-and-slate/next/concepts/provenance",
  "/governance",
  "/news",
  "/search?q=RFC%201",
  "/privacy",
  "/design-system",
];

test.describe("release-candidate accessibility", () => {
  for (const route of routes) {
    test(`${route} has no serious or critical axe violations`, async ({ page }) => {
      await page.goto(route);
      const results = await new AxeBuilder({ page }).analyze();
      expect(
        results.violations.filter(({ impact }) => impact === "serious" || impact === "critical"),
        results.violations.map(({ id, help }) => `${id}: ${help}`).join("\n"),
      ).toEqual([]);
    });
  }

  test("search dialog supports keyboard focus and escape close", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Search" }).click();
    const dialog = page.getByRole("dialog", { name: "Search Paper & Slate" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("textbox")).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page.getByRole("button", { name: "Search" })).toBeFocused();
  });

  test("mobile navigation exposes a modal focus boundary", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("button", { name: "Open navigation" }).click();
    const dialog = page.getByRole("dialog", { name: "Navigate" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Close" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });
});
