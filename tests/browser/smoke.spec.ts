import { test, expect } from "@playwright/test";
test("homepage and health are reachable", async ({ page, request }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Paper & Slate/);
  await expect(page.locator("h1")).toBeVisible();
  const health = await request.get("/health");
  expect(health.ok()).toBeTruthy();
  expect((await health.json()).status).toBe("ok");
});
test("keyboard navigation reaches main content", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeVisible();
});

test("search page returns local indexed records", async ({ page }) => {
  await page.goto("/search?q=RFC%201");
  await expect(page).toHaveTitle(/Paper & Slate/);
  await expect(page.getByRole("heading", { name: "Find the work." })).toBeVisible();
  await expect(page.getByText(/results for “RFC 1”\./)).toBeVisible();
  await expect(page.getByRole("heading", { name: /RFC 1: Stable identifiers/ })).toBeVisible();
  await expect(page.getByText(/Provider: static/)).toBeVisible();
});

test("header search dialog opens and links to results", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open search" }).click();
  await expect(page.getByRole("dialog", { name: "Search Paper & Slate" })).toBeVisible();
  await page.getByRole("dialog").getByRole("textbox", { name: "Search" }).fill("RFC 1");
  await expect(
    page.getByRole("dialog").getByRole("link", { name: "View results →" }),
  ).toHaveAttribute("href", "/search?q=RFC%201");
});

test("route catalog landings are reachable on the dedicated test port", async ({ request }) => {
  const routes = [
    "/docs/getting-started",
    "/docs/concepts",
    "/docs/guides",
    "/docs/reference",
    "/docs/tools",
    "/docs/governance",
    "/news/category/news",
    "/news/tag/implementation",
    "/governance/contributing",
    "/governance/code-of-conduct",
    "/governance/security",
    "/governance/conflicts",
    "/governance/trademarks",
    "/governance/licenses",
  ];
  for (const route of routes) expect((await request.get(route)).ok(), route).toBeTruthy();
});
