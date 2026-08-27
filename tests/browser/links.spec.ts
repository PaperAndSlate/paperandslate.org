import { expect, test } from "@playwright/test";

const seedRoutes = [
  "/",
  "/foundation",
  "/projects",
  "/search?q=RFC%201",
  "/docs",
  "/news",
  "/governance",
  "/privacy",
  "/terms",
  "/accessibility",
  "/security",
];

test("public internal links resolve without 4xx/5xx responses", async ({
  page,
  request,
  baseURL,
}) => {
  test.setTimeout(120_000);
  const queue = [...seedRoutes];
  const visited = new Set<string>();
  const failures: string[] = [];

  while (queue.length > 0 && visited.size < 120) {
    const route = queue.shift()!;
    const url = new URL(route, baseURL);
    const normalized = `${url.pathname}${url.search}`;
    if (visited.has(normalized)) continue;
    visited.add(normalized);

    const response = await request.get(normalized);
    if (!response.ok()) {
      failures.push(`${normalized} -> ${response.status()}`);
      continue;
    }

    await page.goto(normalized, { waitUntil: "domcontentloaded" });
    const links = await page.locator("a[href]").evaluateAll((anchors) =>
      anchors
        .map((anchor) => anchor.getAttribute("href"))
        .filter((href): href is string => Boolean(href && href.startsWith("/")))
        .map((href) => href.split("#")[0]),
    );
    for (const href of links) {
      if (!href.startsWith("/_next") && !href.startsWith("/api/")) queue.push(href);
    }
  }

  expect(visited.size).toBeGreaterThan(seedRoutes.length);
  expect(failures, failures.join("\n")).toEqual([]);
});
