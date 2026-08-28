import { createHash } from "node:crypto";
import { execFileSync, spawn, spawnSync, type ChildProcess } from "node:child_process";
import { access, cp, mkdir, rm, stat, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { chromium, type Browser, type Page } from "@playwright/test";
import { waitForImages } from "./browser-assets";
import { readSourceState } from "./source-state";

const root = process.cwd();
const port = Number(process.env.PRODUCTION_VISUAL_PORT ?? 3315);
const localBaseUrl = `http://127.0.0.1:${port}`;
const hostedStagingOrigin = "https://paper-and-slate-web.dev.tower";
const externalBaseUrl = (() => {
  const raw = process.env.PRODUCTION_VISUAL_BASE_URL;
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
      `Hosted visual evidence is restricted to the exact HTTPS staging origin ${hostedStagingOrigin}`,
    );
  return url.origin;
})();
const baseUrl = externalBaseUrl ?? localBaseUrl;
const standaloneRoot = path.join(root, "apps", "web", ".next", "standalone");
const runtimeRoot = path.join(
  root,
  ".generated",
  "launch",
  `production-visual-runtime-${process.pid}`,
);
const outputRoot = path.join(root, ".generated", "launch", "visual");
const manifestPath = path.join(outputRoot, "manifest.json");
const releaseId = process.env.RELEASE_ID ?? "local-production-visual";
const localSourceSha = git(["rev-parse", "HEAD"]);
const debug = process.env.PRODUCTION_VISUAL_DEBUG === "true";
const systemChromeCandidates = [
  process.env.PLAYWRIGHT_EXECUTABLE_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
].filter((candidate): candidate is string => Boolean(candidate && existsSync(candidate)));

type Capture = {
  id: string;
  route: string;
  theme: "light" | "dark" | "system";
  viewport: { width: number; height: number };
  screenshot: string;
  screenshotSha256?: string;
  screenshotBytes?: number;
  referencePath: string;
  referenceSha256?: string;
  comparison: "human-review-pending" | "reference-missing";
  runtimeErrors: string[];
};

type MatrixItem = Omit<
  Capture,
  | "screenshot"
  | "screenshotSha256"
  | "screenshotBytes"
  | "referenceSha256"
  | "comparison"
  | "runtimeErrors"
> & {
  interaction?: "search";
};

const matrix: MatrixItem[] = [
  {
    id: "home-desktop-light",
    route: "/",
    theme: "light",
    viewport: { width: 1440, height: 1100 },
    referencePath: "plans/assets/mockups/01-home-desktop.png",
  },
  {
    id: "foundation-mission",
    route: "/foundation/mission",
    theme: "light",
    viewport: { width: 1440, height: 1100 },
    referencePath: "plans/assets/mockups/02-foundation-mission.png",
  },
  {
    id: "projects-index",
    route: "/projects",
    theme: "light",
    viewport: { width: 1440, height: 1100 },
    referencePath: "plans/assets/mockups/03-projects-index.png",
  },
  {
    id: "project-detail",
    route: "/projects/file-system",
    theme: "light",
    viewport: { width: 1440, height: 1100 },
    referencePath: "plans/assets/mockups/04-project-detail.png",
  },
  {
    id: "governance",
    route: "/governance",
    theme: "light",
    viewport: { width: 1440, height: 1100 },
    referencePath: "plans/assets/mockups/05-governance.png",
  },
  {
    id: "news-index",
    route: "/news",
    theme: "light",
    viewport: { width: 1440, height: 1100 },
    referencePath: "plans/assets/mockups/06-news-index.png",
  },
  {
    id: "news-article",
    route: "/news/local-publishing-foundations",
    theme: "light",
    viewport: { width: 1440, height: 1100 },
    referencePath: "plans/assets/mockups/07-news-article.png",
  },
  {
    id: "docs-home",
    route: "/docs",
    theme: "light",
    viewport: { width: 1440, height: 1100 },
    referencePath: "plans/assets/mockups/08-docs-home.png",
  },
  {
    id: "docs-reference",
    route: "/docs/file-system/v/1.0/reference/metadata",
    theme: "light",
    viewport: { width: 1440, height: 1100 },
    referencePath: "plans/assets/mockups/09-docs-reference-page.png",
  },
  {
    id: "global-search-overlay",
    route: "/",
    theme: "light",
    viewport: { width: 1440, height: 1100 },
    referencePath: "plans/assets/mockups/10-global-search-overlay.png",
    interaction: "search",
  },
  {
    id: "component-library",
    route: "/design-system",
    theme: "light",
    viewport: { width: 1440, height: 1100 },
    referencePath: "plans/assets/mockups/11-component-library.png",
  },
  {
    id: "home-desktop-dark",
    route: "/",
    theme: "dark",
    viewport: { width: 1440, height: 1100 },
    referencePath: "plans/assets/mockups/12-dark-mode-home.png",
  },
  {
    id: "home-mobile",
    route: "/",
    theme: "light",
    viewport: { width: 390, height: 844 },
    referencePath: "plans/assets/mockups/13-home-mobile.png",
  },
];

function git(args: string[]) {
  try {
    return execFileSync(process.platform === "win32" ? "git.exe" : "git", args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "uncommitted";
  }
}

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
      if ((await fetch(url, { signal: AbortSignal.timeout(2_000) })).ok) return;
    } catch {
      // The local standalone process is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Production visual target did not become ready at ${url}`);
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

async function waitForHydration(page: Page) {
  await page.evaluate(async () => {
    await document.fonts?.ready;
  });
  await waitForImages(page, Number(process.env.PRODUCTION_VISUAL_IMAGE_TIMEOUT_MS));
  await page.locator('[data-theme-mounted="true"]').first().waitFor({ state: "attached" });
  await page.locator("h1").first().waitFor({ state: "visible" });
  await page.waitForTimeout(100);
}

async function setTheme(page: Page, theme: MatrixItem["theme"]) {
  await page.evaluate((value) => {
    window.localStorage.removeItem("paper-slate-theme");
    document.documentElement.classList.remove("light", "dark");
    if (value !== "system") document.documentElement.classList.add(value);
  }, theme);
  const control = page.locator('select[aria-label="Color theme"]:visible').first();
  if (await control.count()) await control.selectOption(theme);
  await page.waitForTimeout(250);
}

async function capturePage(page: Page, item: MatrixItem, outputPath: string): Promise<Capture> {
  const runtimeErrors: string[] = [];
  let searchInteractionOpen = false;
  page.removeAllListeners("console");
  page.removeAllListeners("pageerror");
  page.removeAllListeners("requestfailed");
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => runtimeErrors.push(`pageerror: ${error.message}`));
  page.on("requestfailed", (request) => {
    if (request.failure()?.errorText !== "net::ERR_ABORTED")
      runtimeErrors.push(
        `requestfailed: ${request.url()} — ${request.failure()?.errorText ?? "unknown"}`,
      );
  });
  await page.setViewportSize(item.viewport);
  const response = await page.goto(`${baseUrl}${item.route}`, { waitUntil: "load" });
  if (!response?.ok())
    throw new Error(`${item.route} returned ${response?.status() ?? "no response"}`);
  await waitForHydration(page);
  await setTheme(page, item.theme);
  if (item.interaction === "search") {
    await page.getByRole("button", { name: "Search" }).click();
    const dialog = page.getByRole("dialog", { name: "Search Paper & Slate" });
    await dialog.getByRole("textbox", { name: /Search/ }).fill("RFC 1");
    await dialog
      .getByText(/result/i)
      .first()
      .waitFor({ state: "visible" });
    searchInteractionOpen = true;
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(50);
  await page.screenshot({ path: outputPath, fullPage: !searchInteractionOpen });
  if (searchInteractionOpen) {
    await page.getByRole("button", { name: "Close search" }).click();
    await page.locator(".search-dialog").waitFor({ state: "hidden" });
  }
  const screenshotBytes = (await stat(outputPath)).size;
  const screenshotSha256 = createHash("sha256").update(readFileSync(outputPath)).digest("hex");
  const referenceAbsolute = path.join(root, item.referencePath);
  const referenceSha256 = existsSync(referenceAbsolute)
    ? createHash("sha256").update(readFileSync(referenceAbsolute)).digest("hex")
    : undefined;
  return {
    ...item,
    screenshot: path.relative(root, outputPath).replaceAll(path.sep, "/"),
    screenshotSha256,
    screenshotBytes,
    referenceSha256,
    comparison: referenceSha256 ? "human-review-pending" : "reference-missing",
    runtimeErrors,
  };
}

async function main() {
  let server: ChildProcess | undefined;
  let browser: Browser | undefined;
  const captures: Capture[] = [];
  const errors: string[] = [];
  try {
    if (!externalBaseUrl) {
      if (debug) console.error(`[production:visual] preparing ${runtimeRoot}`);
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
          NEXT_PUBLIC_SITE_URL: localBaseUrl,
          SEARCH_PROVIDER: "static",
          KIT_ENABLED: "false",
          NODE_PATH: [path.join(root, "apps", "web", "node_modules"), process.env.NODE_PATH]
            .filter(Boolean)
            .join(path.delimiter),
          RELEASE_ID: releaseId,
          GIT_SHA: process.env.GIT_SHA ?? git(["rev-parse", "HEAD"]),
        },
        stdio: "ignore",
        windowsHide: true,
      });
    }
    await waitForServer(`${baseUrl}/health`);
    const health = (await (await fetch(`${baseUrl}/health`)).json()) as {
      status?: string;
      deployment?: string;
      releaseId?: string;
      gitSha?: string;
    };
    const expectedGitSha = process.env.GIT_SHA ?? git(["rev-parse", "HEAD"]);
    if (!externalBaseUrl && process.env.GIT_SHA && process.env.GIT_SHA !== localSourceSha)
      throw new Error(
        `Local production visual evidence requires GIT_SHA ${localSourceSha ?? "the current source revision"}; got ${process.env.GIT_SHA}`,
      );
    if (externalBaseUrl && (!process.env.RELEASE_ID || !process.env.GIT_SHA))
      throw new Error(
        "Hosted visual evidence requires RELEASE_ID and GIT_SHA for the exact candidate",
      );
    if (externalBaseUrl && !/^[a-f0-9]{40}$/i.test(expectedGitSha))
      throw new Error(
        "Hosted visual evidence requires GIT_SHA to identify the exact candidate SHA",
      );
    if (
      health.status !== "ok" ||
      health.releaseId !== releaseId ||
      health.gitSha !== expectedGitSha ||
      (externalBaseUrl && health.deployment !== "staging") ||
      (process.env.PRODUCTION_VISUAL_EXPECTED_DEPLOYMENT &&
        health.deployment !== process.env.PRODUCTION_VISUAL_EXPECTED_DEPLOYMENT)
    )
      throw new Error(
        `Visual target identity mismatch: ${health.deployment ?? "missing"}/${health.releaseId ?? "missing"}/${health.gitSha ?? "missing"}`,
      );
    browser = await chromium.launch({ headless: true, executablePath: systemChromeCandidates[0] });
    const page = await browser.newPage();
    page.setDefaultTimeout(15_000);
    await mkdir(outputRoot, { recursive: true });
    for (const item of matrix) {
      const outputPath = path.join(outputRoot, `${item.id}.png`);
      try {
        captures.push(await capturePage(page, item, outputPath));
      } catch (error) {
        errors.push(`${item.id}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    const runtimeErrors = captures.flatMap((capture) =>
      capture.runtimeErrors.map((error) => `${capture.id}: ${error}`),
    );
    errors.push(...runtimeErrors);
    const manifest = {
      schemaVersion: 1,
      status:
        errors.length === 0 && captures.length === matrix.length
          ? "human-review-pending"
          : "failed",
      releaseId,
      gitSha: expectedGitSha,
      target: baseUrl,
      generatedAt: new Date().toISOString(),
      referencePolicy:
        "Supplied mockups are references only; no pixel match or approval is claimed automatically.",
      captures,
      errors,
      source: readSourceState(root),
    };
    await mkdir(path.dirname(manifestPath), { recursive: true });
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    if (errors.length > 0 || captures.length !== matrix.length)
      throw new Error(
        `Production visual evidence failed with ${errors.length} runtime or capture error(s).`,
      );
    console.log(
      `Captured ${captures.length} production visual states. Evidence: ${path.relative(root, manifestPath)}`,
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
    await mkdir(path.dirname(manifestPath), { recursive: true });
    await writeFile(
      manifestPath,
      `${JSON.stringify(
        {
          schemaVersion: 1,
          status: "failed",
          releaseId,
          gitSha: process.env.GIT_SHA ?? git(["rev-parse", "HEAD"]),
          target: baseUrl,
          generatedAt: new Date().toISOString(),
          referencePolicy:
            "Supplied mockups are references only; no pixel match or approval is claimed automatically.",
          captures: [],
          errors: [message],
          source: readSourceState(root),
        },
        null,
        2,
      )}\n`,
      "utf8",
    );
  } catch {
    // Preserve the original visual failure when the evidence file cannot be written.
  }
  console.error(message);
  process.exitCode = 1;
});
