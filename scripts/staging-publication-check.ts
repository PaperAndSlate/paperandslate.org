import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { readBoundedJson, readBoundedResponse } from "../packages/config/src/provider-safety";
import { inspectSecurityHeaders, type SecurityHeaderStatus } from "./hosted-security-headers";
import { assertResponseOrigin } from "./hosted-origin";

const root = process.cwd();
const stagingUrl = process.env.STAGING_URL;
const expectedRelease = process.env.RELEASE_ID ?? "";
const expectedGitSha = process.env.GIT_SHA ?? "";
const outputPath = path.join(root, ".generated", "launch", "staging-publication.json");
const hostedStagingOrigin = "https://paper-and-slate-web.dev.tower";
const HEALTH_RESPONSE_LIMIT_BYTES = 64 * 1024;
const ROUTE_RESPONSE_LIMIT_BYTES = 8 * 1024 * 1024;

const routeDefinitions = [
  { path: "/", contentType: "text/html" },
  { path: "/projects", contentType: "text/html" },
  { path: "/standards/changes", contentType: "text/html" },
  { path: "/feeds/rss.xml", contentType: "application/rss+xml" },
  { path: "/feeds/atom.xml", contentType: "application/atom+xml" },
  { path: "/feeds/feed.json", contentType: "application/json" },
  { path: "/robots.txt", contentType: "text/plain" },
  { path: "/sitemap.xml", contentType: "application/xml" },
  { path: "/llms.txt", contentType: "text/plain" },
  { path: "/llms-full.txt", contentType: "text/plain" },
  { path: "/projects.json", contentType: "application/json" },
  { path: "/api/search?q=paper", contentType: "application/json" },
] as const;

type Health = {
  status?: string;
  deployment?: string;
  releaseId?: string;
  gitSha?: string;
};

type RouteEvidence = {
  path: string;
  status: number | null;
  contentType: string | null;
  bytes: number;
  bodySha256: string | null;
  securityHeaders: SecurityHeaderStatus | null;
  valid: boolean;
  error?: string;
};

type PublicationEvidence = {
  schemaVersion: 1;
  status: "passed" | "failed";
  startedAt: string;
  finishedAt: string;
  targetUrl: string;
  releaseId: string;
  gitSha: string;
  deploymentId: string | null;
  health: Health | null;
  routes: RouteEvidence[];
  feedItemCounts: { rss: number | null; atom: number | null; json: number | null };
  issues: string[];
};

function safeTargetUrl(value: string | undefined) {
  if (!value) return "missing";
  try {
    return new URL(value).origin;
  } catch {
    return "invalid";
  }
}

function requireStagingUrl() {
  if (!stagingUrl) throw new Error("STAGING_URL is required for staging publication evidence");
  const parsed = new URL(stagingUrl);
  if (parsed.origin !== hostedStagingOrigin)
    throw new Error(
      `Staging publication checks are restricted to the exact HTTPS staging origin ${hostedStagingOrigin}`,
    );
  if (parsed.pathname !== "/")
    throw new Error("STAGING_URL must be the managed staging origin without a path");
  if (parsed.username || parsed.password || parsed.search || parsed.hash)
    throw new Error("STAGING_URL must not contain credentials, query parameters, or fragments");
  return parsed;
}

function bodySha256(body: string) {
  return createHash("sha256").update(body).digest("hex");
}

function hasLocalAddress(body: string) {
  return /https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?/i.test(body);
}

function countMatches(body: string, pattern: RegExp) {
  return body.match(pattern)?.length ?? 0;
}

async function fetchRoute(base: URL, definition: (typeof routeDefinitions)[number]) {
  const url = `${base.origin}${definition.path}`;
  try {
    const response = await fetch(url, {
      redirect: "error",
      signal: AbortSignal.timeout(15_000),
    });
    assertResponseOrigin(response.url, base.origin, `Staging route ${definition.path}`);
    const body = await readBoundedResponse(response, ROUTE_RESPONSE_LIMIT_BYTES);
    const contentType = response.headers.get("content-type");
    const securityHeaders = inspectSecurityHeaders(response.headers, base.protocol === "https:");
    const valid =
      response.status === 200 &&
      Boolean(contentType?.toLowerCase().includes(definition.contentType)) &&
      !hasLocalAddress(body) &&
      securityHeaders.issues.length === 0;
    const issues = [
      ...(response.status !== 200 ? [`Expected status 200, received ${response.status}`] : []),
      ...(contentType?.toLowerCase().includes(definition.contentType)
        ? []
        : [`Expected content type ${definition.contentType}`]),
      ...(hasLocalAddress(body) ? ["Response contains a localhost reference"] : []),
      ...securityHeaders.issues,
    ];
    return {
      evidence: {
        path: definition.path,
        status: response.status,
        contentType,
        bytes: Buffer.byteLength(body),
        bodySha256: bodySha256(body),
        securityHeaders: securityHeaders.status,
        valid,
        ...(valid
          ? {}
          : {
              error: issues.join("; "),
            }),
      } satisfies RouteEvidence,
      body,
    };
  } catch (error) {
    return {
      evidence: {
        path: definition.path,
        status: null,
        contentType: null,
        bytes: 0,
        bodySha256: null,
        securityHeaders: null,
        valid: false,
        error: error instanceof Error ? error.message : String(error),
      } satisfies RouteEvidence,
      body: "",
    };
  }
}

function validateFeedBodies(base: URL, bodies: Map<string, string>, issues: string[]) {
  const rssBody = bodies.get("/feeds/rss.xml") ?? "";
  const atomBody = bodies.get("/feeds/atom.xml") ?? "";
  const jsonBody = bodies.get("/feeds/feed.json") ?? "";
  const sitemapBody = bodies.get("/sitemap.xml") ?? "";
  const rss = countMatches(rssBody, /<item>/g);
  const atom = countMatches(atomBody, /<entry>/g);
  let json: number | null = null;

  if (
    !rssBody.startsWith("<?xml") ||
    !/<rss[\s\S]*<channel>[\s\S]*<\/channel>[\s\S]*<\/rss>/.test(rssBody)
  )
    issues.push("RSS feed is not structurally valid");
  if (!atomBody.startsWith("<?xml") || !/<feed[\s\S]*<\/feed>/.test(atomBody))
    issues.push("Atom feed is not structurally valid");
  if (rss < 1) issues.push("RSS feed contains no published items");
  if (atom < 1) issues.push("Atom feed contains no published entries");

  try {
    const parsed = JSON.parse(jsonBody) as {
      version?: string;
      home_page_url?: string;
      feed_url?: string;
      items?: unknown[];
    };
    json = Array.isArray(parsed.items) ? parsed.items.length : null;
    if (parsed.version !== "https://jsonfeed.org/version/1.1")
      issues.push("JSON Feed version is invalid");
    if (parsed.home_page_url !== `${base.origin}/news`)
      issues.push("JSON Feed home_page_url does not use the staging canonical origin");
    if (parsed.feed_url !== `${base.origin}/feeds/feed.json`)
      issues.push("JSON Feed feed_url does not use the staging canonical origin");
    if (!json) issues.push("JSON Feed contains no published items");
  } catch {
    issues.push("JSON Feed is not valid JSON");
  }

  if (!/<urlset[\s\S]*<\/urlset>/.test(sitemapBody))
    issues.push("Sitemap is not structurally valid");
  const locations = [...sitemapBody.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  if (!locations.length) issues.push("Sitemap contains no locations");
  if (locations.some((location) => !location.startsWith(`${base.origin}/`)))
    issues.push("Sitemap contains a non-staging canonical location");

  return { rss, atom, json };
}

async function writeEvidence(evidence: PublicationEvidence) {
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
}

async function main() {
  const base = requireStagingUrl();
  if (
    !expectedRelease ||
    !expectedGitSha ||
    !/^[a-f0-9]{40}$/i.test(expectedGitSha) ||
    !process.env.STAGING_DEPLOYMENT_ID
  )
    throw new Error(
      "RELEASE_ID, a full GIT_SHA, and STAGING_DEPLOYMENT_ID are required for exact staging identity validation",
    );

  const startedAt = new Date().toISOString();
  const healthResponse = await fetch(`${base.origin}/health`, {
    redirect: "error",
    signal: AbortSignal.timeout(15_000),
  });
  assertResponseOrigin(healthResponse.url, base.origin, "Staging health response");
  const rawHealth = await readBoundedJson<Health>(healthResponse, HEALTH_RESPONSE_LIMIT_BYTES);
  const health: Health = {
    status: rawHealth.status,
    deployment: rawHealth.deployment,
    releaseId: rawHealth.releaseId,
    gitSha: rawHealth.gitSha,
  };
  const issues: string[] = [];
  if (healthResponse.status !== 200) issues.push(`Health returned ${healthResponse.status}`);
  if (health.status !== "ok") issues.push("Health did not report status=ok");
  if (health.deployment !== "staging")
    issues.push(`Health deployment identity is ${health.deployment ?? "missing"}, not staging`);
  if (health.releaseId !== expectedRelease)
    issues.push(`Health release identity mismatch: expected ${expectedRelease}`);
  if (health.gitSha !== expectedGitSha)
    issues.push(`Health Git identity mismatch: expected ${expectedGitSha}`);

  const fetched = await Promise.all(
    routeDefinitions.map((definition) => fetchRoute(base, definition)),
  );
  const routes = fetched.map(({ evidence }) => evidence);
  for (const route of routes) if (!route.valid) issues.push(`${route.path}: ${route.error}`);
  const bodies = new Map(
    routeDefinitions.map((definition, index) => [definition.path, fetched[index].body]),
  );
  const feedItemCounts = validateFeedBodies(base, bodies, issues);
  const evidence: PublicationEvidence = {
    schemaVersion: 1,
    status: issues.length ? "failed" : "passed",
    startedAt,
    finishedAt: new Date().toISOString(),
    targetUrl: base.origin,
    releaseId: expectedRelease,
    gitSha: expectedGitSha,
    deploymentId: process.env.STAGING_DEPLOYMENT_ID,
    health,
    routes,
    feedItemCounts,
    issues,
  };
  await writeEvidence(evidence);
  if (issues.length) throw new Error(`Staging publication checks failed: ${issues.join("; ")}`);
  console.log(
    `Staging publication checks passed for ${expectedRelease}/${expectedGitSha}. Evidence: ${path.relative(root, outputPath)}`,
  );
}

main().catch(async (error) => {
  const message = error instanceof Error ? error.message : String(error);
  try {
    await writeEvidence({
      schemaVersion: 1,
      status: "failed",
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      targetUrl: safeTargetUrl(stagingUrl),
      releaseId: expectedRelease,
      gitSha: expectedGitSha,
      deploymentId: process.env.STAGING_DEPLOYMENT_ID ?? null,
      health: null,
      routes: [],
      feedItemCounts: { rss: null, atom: null, json: null },
      issues: [message],
    });
  } catch {
    // Preserve the original failure when evidence output itself is unavailable.
  }
  console.error(message);
  process.exitCode = 1;
});
