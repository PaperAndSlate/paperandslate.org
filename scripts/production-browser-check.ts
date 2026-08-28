import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { access, cp, mkdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { chromium, type Browser, type Page } from "@playwright/test";
import { waitForImages } from "./browser-assets";
import { readSourceState } from "./source-state";

const root = process.cwd();
const port = Number(process.env.PRODUCTION_BROWSER_PORT ?? 3300);
const localBaseUrl = `http://127.0.0.1:${port}`;
const hostedStagingOrigin = "https://paper-and-slate-web.dev.tower";
const externalBaseUrl = (() => {
  const raw = process.env.PRODUCTION_BROWSER_BASE_URL;
  if (!raw) return undefined;
  const url = new URL(raw);
  if (
    url.origin !== hostedStagingOrigin ||
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    url.username ||
    url.password
  )
    throw new Error(
      `Hosted browser evidence is restricted to the exact HTTPS staging origin ${hostedStagingOrigin}`,
    );
  return url.origin;
})();
const baseUrl = externalBaseUrl ?? localBaseUrl;
const standaloneRoot = path.join(root, "apps", "web", ".next", "standalone");
const runtimeRoot = path.join(
  root,
  ".generated",
  "launch",
  `production-browser-runtime-${process.pid}`,
);
const evidencePath = path.join(root, ".generated", "launch", "production-browser.json");
const debug = process.env.PRODUCTION_BROWSER_DEBUG === "true";
const localSourceSha = readSourceState(root).commit ?? "local-production-check";
const systemChromeCandidates = [
  process.env.PLAYWRIGHT_EXECUTABLE_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
].filter((candidate): candidate is string => Boolean(candidate && existsSync(candidate)));

type BrowserEvidence = {
  releaseId: string;
  gitSha: string;
  baseUrl: string;
  routes: string[];
  csp: string;
  scriptCount: number;
  errors: string[];
  passed: boolean;
  source: {
    commit: string | null;
    tree: string | null;
    worktreeClean: boolean;
    dirtyPaths: string[];
  };
};

function stopServer(server: ChildProcess) {
  if (!server.pid) return;
  if (process.platform === "win32")
    spawnSync("taskkill", ["/pid", String(server.pid), "/t", "/f"], { stdio: "ignore" });
  else server.kill("SIGTERM");
}

async function waitForServer(url: string) {
  const deadline = Date.now() + 45_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(2_000) });
      if (response.ok) return;
    } catch {
      // The standalone server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Production server did not become ready at ${url}`);
}

async function prepareRuntime() {
  await rm(runtimeRoot, { recursive: true, force: true });
  await mkdir(path.join(runtimeRoot, "apps", "web"), { recursive: true });
  await cp(
    path.join(standaloneRoot, "apps", "web", "server.js"),
    path.join(runtimeRoot, "apps", "web", "server.js"),
  );
  await cp(
    path.join(standaloneRoot, "apps", "web", ".next"),
    path.join(runtimeRoot, "apps", "web", ".next"),
    { recursive: true },
  );
  await cp(
    path.join(root, "apps", "web", ".next", "static"),
    path.join(runtimeRoot, "apps", "web", ".next", "static"),
    { recursive: true },
  );
  await cp(
    path.join(root, "apps", "web", "public"),
    path.join(runtimeRoot, "apps", "web", "public"),
    { recursive: true },
  );
}

async function assertPage(
  page: Page,
  route: string,
  options: { requireThemeControl?: boolean } = {},
) {
  if (debug) console.error(`[production:browser] opening ${route}`);
  const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "load" });
  if (debug) console.error(`[production:browser] loaded ${route}`);
  if (!response?.ok()) throw new Error(`${route} returned ${response?.status() ?? "no response"}`);
  await page.evaluate(async () => {
    await document.fonts?.ready;
  });
  await waitForImages(page, Number(process.env.PRODUCTION_BROWSER_IMAGE_TIMEOUT_MS));
  await page.waitForTimeout(50);
  await page.locator('[data-theme-mounted="true"]').first().waitFor({ state: "attached" });
  if (options.requireThemeControl !== false)
    await page
      .locator('select[aria-label="Color theme"]:visible')
      .first()
      .waitFor({ state: "visible" });
  if (debug) console.error(`[production:browser] hydrated ${route}`);
  await page.locator("body").evaluate((body) => {
    if ((body.textContent ?? "").trim().length < 40)
      throw new Error("page body is unexpectedly empty");
  });
  await page.locator("h1").first().waitFor({ state: "visible" });
  return response;
}

async function main() {
  let server: ChildProcess | undefined;
  if (!externalBaseUrl) {
    if (debug) console.error(`[production:browser] preparing ${runtimeRoot}`);
    await prepareRuntime();
    const serverPath = path.join(runtimeRoot, "apps", "web", "server.js");
    await access(serverPath);
    server = spawn(process.execPath, [serverPath], {
      cwd: runtimeRoot,
      env: {
        ...process.env,
        NODE_ENV: "production",
        HOSTNAME: "127.0.0.1",
        PORT: String(port),
        NEXT_PUBLIC_SITE_URL: baseUrl,
        SEARCH_PROVIDER: "static",
        KIT_ENABLED: "false",
        NODE_PATH: [path.join(root, "apps", "web", "node_modules"), process.env.NODE_PATH]
          .filter(Boolean)
          .join(path.delimiter),
        RELEASE_ID: process.env.RELEASE_ID ?? "local-production-check",
        GIT_SHA: process.env.GIT_SHA ?? localSourceSha,
      },
      stdio: "ignore",
      windowsHide: true,
    });
    if (debug) console.error(`[production:browser] server pid ${server.pid}`);
  }
  let browser: Browser | undefined;
  const errors: string[] = [];
  const routes = [
    "/",
    "/projects",
    "/docs/paper-and-slate",
    "/docs/file-system",
    "/docs/well-known-discovery",
    "/docs/organization-schema",
    "/docs/curriculum-standards-schema",
    "/docs/course-catalog-schema",
    "/docs/tools-and-libraries",
    "/docs/file-system/v/1.0/reference/metadata",
    "/design-system",
    "/search?q=RFC%201",
  ];
  let csp = "";
  let scriptCount = 0;
  try {
    await waitForServer(`${baseUrl}/health`);
    if (debug) console.error("[production:browser] health ready");
    const healthResponse = await fetch(`${baseUrl}/health`);
    const health = (await healthResponse.json()) as {
      releaseId?: string;
      gitSha?: string;
      deployment?: string;
    };
    const expectedRelease = process.env.RELEASE_ID ?? "local-production-check";
    const expectedSha = process.env.GIT_SHA ?? localSourceSha;
    if (!externalBaseUrl && process.env.GIT_SHA && process.env.GIT_SHA !== localSourceSha)
      throw new Error(
        `Local production browser evidence requires GIT_SHA ${localSourceSha}; got ${process.env.GIT_SHA}`,
      );
    if (externalBaseUrl && (!process.env.RELEASE_ID || !process.env.GIT_SHA))
      throw new Error(
        "Hosted browser evidence requires RELEASE_ID and GIT_SHA for the exact candidate",
      );
    if (externalBaseUrl && !/^[a-f0-9]{40}$/i.test(expectedSha))
      throw new Error(
        "Hosted browser evidence requires GIT_SHA to identify the exact candidate SHA",
      );
    if (
      health.releaseId !== expectedRelease ||
      health.gitSha !== expectedSha ||
      (externalBaseUrl && health.deployment !== "staging")
    )
      throw new Error(
        `Production identity mismatch: expected ${health.deployment ?? "local"}/${expectedRelease}/${expectedSha}, got ${health.deployment ?? "missing"}/${health.releaseId ?? "missing"}/${health.gitSha ?? "missing"}`,
      );
    browser = await chromium.launch({
      headless: true,
      executablePath: systemChromeCandidates[0],
    });
    if (debug) console.error("[production:browser] browser ready");
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
    page.setDefaultTimeout(15_000);
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(`console: ${message.text()}`);
    });
    page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
    page.on("requestfailed", (request) =>
      request.failure()?.errorText !== "net::ERR_ABORTED"
        ? errors.push(
            `requestfailed: ${request.url()} — ${request.failure()?.errorText ?? "unknown"}`,
          )
        : undefined,
    );
    page.on("response", (response) => {
      if (response.request().resourceType() === "script" && !response.ok())
        errors.push(`script response ${response.status()}: ${response.url()}`);
    });

    const home = await assertPage(page, routes[0]);
    csp = home.headers()["content-security-policy"] ?? "";
    const scriptPolicy =
      csp.split(";").find((directive) => directive.trim().startsWith("script-src")) ?? "";
    if (scriptPolicy.includes("'unsafe-eval'"))
      throw new Error("production CSP permits unsafe-eval");
    if (scriptPolicy.includes("'unsafe-inline'"))
      throw new Error("production CSP permits inline scripts");
    if (!/'nonce-[^']+'/.test(scriptPolicy))
      throw new Error("production CSP is missing a script nonce");
    scriptCount = await page.locator("script[src]").count();
    if (scriptCount === 0) throw new Error("production page emitted no script chunks");

    const theme = page.locator('select[aria-label="Color theme"]:visible').first();
    await theme.selectOption("dark");
    if (!(await page.locator("html").getAttribute("class"))?.includes("dark"))
      throw new Error("dark theme did not apply");
    await theme.selectOption("light");

    const searchTrigger = page.getByRole("button", { name: "Search" });
    await searchTrigger.click();
    const dialog = page.getByRole("dialog", { name: "Search Paper & Slate" });
    await dialog.getByRole("textbox", { name: /Search/ }).fill("RFC 1");
    await dialog
      .getByText(/result/i)
      .first()
      .waitFor({ state: "visible" });
    await page.keyboard.press("Escape");
    await searchTrigger.waitFor({ state: "visible" });

    await page.setViewportSize({ width: 390, height: 844 });
    await assertPage(page, "/", { requireThemeControl: false });
    await page.getByRole("button", { name: "Open navigation" }).click();
    await page.getByRole("dialog", { name: "Navigate" }).waitFor({ state: "visible" });
    await page.getByRole("button", { name: "Close", exact: true }).click();
    await page.getByLabel("Email address").waitFor({ state: "visible" });

    await page.setViewportSize({ width: 1440, height: 1100 });
    for (const route of routes.slice(1)) await assertPage(page, route);
    for (const route of [
      "/docs/raw/paper-and-slate",
      "/docs/raw/file-system",
      "/feeds/rss.xml",
      "/feeds/atom.xml",
      "/feeds/feed.json",
      "/sitemap.xml",
      "/robots.txt",
      "/llms.txt",
      "/llms-full.txt",
    ]) {
      const response = await fetch(`${baseUrl}${route}`);
      if (!response.ok) throw new Error(`${route} returned ${response.status}`);
    }
    if (errors.length) throw new Error(errors.join("\n"));

    const evidence: BrowserEvidence = {
      releaseId: process.env.RELEASE_ID ?? "local-production-check",
      gitSha: process.env.GIT_SHA ?? localSourceSha,
      baseUrl,
      routes,
      csp,
      scriptCount,
      errors,
      passed: true,
      source: readSourceState(root),
    };
    await mkdir(path.dirname(evidencePath), { recursive: true });
    await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
    console.log(
      `Production browser checks passed for ${routes.length} routes. Evidence: ${path.relative(root, evidencePath)}`,
    );
  } finally {
    await browser?.close().catch(() => undefined);
    if (server) stopServer(server);
    await rm(runtimeRoot, { recursive: true, force: true });
  }
}

main().catch(async (error) => {
  const message = error instanceof Error ? error.message : String(error);
  try {
    await mkdir(path.dirname(evidencePath), { recursive: true });
    await writeFile(
      evidencePath,
      `${JSON.stringify(
        {
          schemaVersion: 1,
          releaseId: process.env.RELEASE_ID ?? "local-production-check",
          gitSha: process.env.GIT_SHA ?? localSourceSha,
          baseUrl,
          routes: [],
          csp: "",
          scriptCount: 0,
          errors: [message],
          passed: false,
          source: readSourceState(root),
        },
        null,
        2,
      )}\n`,
      "utf8",
    );
  } catch {
    // Preserve the original browser failure when the evidence file cannot be written.
  }
  console.error(message);
  process.exitCode = 1;
});
