import { expect, test } from "@playwright/test";

test.describe("governance record routes", () => {
  test("filters RFCs by lifecycle metadata and preserves the empty state", async ({ page }) => {
    await page.goto("/governance/rfcs?q=stable%20identifiers&status=accepted");
    await expect(
      page.getByRole("heading", { name: "Stable identifiers for public records" }),
    ).toBeVisible();
    await expect(page.getByText("RFC 1 · accepted · 2026")).toBeVisible();

    await page.goto("/governance/rfcs?q=does-not-exist");
    await expect(page.getByRole("heading", { name: "No RFCs match those filters." })).toBeVisible();
  });

  test("renders RFC references and decision/policy metadata", async ({ page }) => {
    await page.goto("/governance/rfcs/1");
    await expect(page.getByText("Discussion: Not recorded")).toBeVisible();
    await expect(page.getByRole("link", { name: "dec-001" })).toHaveAttribute(
      "href",
      "/governance/decisions/dec-001",
    );

    await page.goto("/governance/decisions/dec-001");
    await expect(page.getByRole("link", { name: "RFC 1" })).toHaveAttribute(
      "href",
      "/governance/rfcs/1",
    );

    await page.goto("/governance/policies/contribution-policy");
    await expect(page.getByRole("heading", { name: "Revision history" })).toBeVisible();
    await expect(
      page.getByText("No revision history is recorded for this local policy."),
    ).toBeVisible();
  });
});
