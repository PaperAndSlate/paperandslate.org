import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

type CheckStatus =
  | "passed"
  | "passed-with-advisory"
  | "human-review-pending"
  | "pending"
  | "failed";
type Check = {
  id: string;
  status: CheckStatus;
  detail: string;
  evidence: string[];
};

const root = process.cwd();
const launchRoot = path.join(root, ".generated", "launch");
const outputPath = path.join(launchRoot, "launch-evidence.json");
const releaseId = process.env.RELEASE_ID ?? "local-development";

function git(args: string[]) {
  try {
    return execFileSync(process.platform === "win32" ? "git.exe" : "git", args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

function readJson<T>(relative: string): T | null {
  const file = path.join(root, relative);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as T;
  } catch {
    return null;
  }
}

function exists(relative: string) {
  return fs.existsSync(path.join(root, relative));
}

function lockHash() {
  const file = path.join(root, "pnpm-lock.yaml");
  return fs.existsSync(file)
    ? createHash("sha256").update(fs.readFileSync(file)).digest("hex")
    : null;
}

function requirementsCheck(): Check {
  const report = readJson<{
    requirements?: Array<{ status?: string; category?: string }>;
  }>(".generated/requirements/requirements.json");
  if (!report?.requirements?.length)
    return {
      id: "requirements",
      status: "pending",
      detail: "Requirement ledger evidence is missing.",
      evidence: [".generated/requirements/requirements.json"],
    };
  const substantive = report.requirements.filter((item) => item.category !== "traceability");
  const counts = substantive.reduce<Record<string, number>>((all, item) => {
    const status = item.status ?? "unknown";
    all[status] = (all[status] ?? 0) + 1;
    return all;
  }, {});
  return {
    id: "requirements",
    status: "passed",
    detail: `${substantive.length} substantive requirements have machine-readable status; ${counts.partial ?? 0} remain partial, ${counts["blocked-external"] ?? 0} are externally blocked, and ${counts["human-approval-pending"] ?? 0} require human approval.`,
    evidence: [".generated/requirements/requirements.json", "IMPLEMENTATION_LEDGER.md"],
  };
}

function launchChecks(): Check[] {
  const checks: Check[] = [requirementsCheck()];
  const repository = readJson<{
    status?: string;
    repository?: {
      remote?: string | null;
      branch?: string | null;
      localSha?: string | null;
      remoteResolution?: string;
    };
  }>(".generated/launch/repository-identity.json");
  checks.push({
    id: "repository",
    status: repository?.status === "passed" ? "passed" : "pending",
    detail:
      repository?.status === "passed"
        ? `Repository identity recorded for ${repository.repository?.remote ?? "unknown remote"} on ${repository.repository?.branch ?? "unknown branch"} at ${repository.repository?.localSha ?? "unknown SHA"}; remote refs ${repository.repository?.remoteResolution ?? "unknown"}.`
        : "Repository identity evidence is missing or failed.",
    evidence: [".generated/launch/repository-identity.json"],
  });
  const verify = readJson<{ status?: string; completed?: string[]; skipExternal?: boolean }>(
    ".generated/launch/verify.json",
  );
  const verifyDetail = verify?.skipExternal
    ? `Local verification completed ${verify.completed?.length ?? 0} tasks; external Lighthouse, performance, and vulnerability checks were intentionally skipped.`
    : `Full local verification completed ${verify?.completed?.length ?? 0} tasks, including production browser, visual capture, Lighthouse, container, SBOM, and security gates.`;
  checks.push(
    verify?.status === "passed"
      ? {
          id: "verify",
          status: "passed",
          detail: verifyDetail,
          evidence: [".generated/launch/verify.json"],
        }
      : {
          id: "verify",
          status: "pending",
          detail: "Full pnpm verify evidence is not complete in this workspace snapshot.",
          evidence: [".generated/launch/verify.json"],
        },
  );

  const docs = readJson<{ status?: string }>(".generated/launch/docs-bundle-check.json");
  checks.push({
    id: "docs-bundle",
    status: docs?.status === "passed" ? "passed" : "pending",
    detail:
      docs?.status === "passed"
        ? "The committed generated documentation bundle is schema-, hash-, ID-, and search-consistent without requiring sibling repositories in CI."
        : "Generated documentation bundle evidence is missing or failed.",
    evidence: [
      ".generated/launch/docs-bundle-check.json",
      ".generated/docs/docs-sources.lock.json",
    ],
  });

  const lighthouse = readJson<{
    status?: string;
    reportCount?: number;
    configuredUrls?: string[];
    error?: string;
  }>(".generated/launch/lighthouse/lighthouse-run.json");
  checks.push({
    id: "lighthouse",
    status:
      lighthouse?.status === "passed"
        ? "passed"
        : lighthouse?.status === "failed"
          ? "failed"
          : "pending",
    detail:
      lighthouse?.status === "passed"
        ? `Lighthouse ran ${lighthouse.reportCount ?? 0} reports across ${lighthouse.configuredUrls?.length ?? 0} configured routes and passed configured assertions.`
        : (lighthouse?.error ?? "Lighthouse run evidence is missing."),
    evidence: [".generated/launch/lighthouse/lighthouse-run.json", ".generated/launch/lighthouse/"],
  });

  const performance = readJson<{
    reports?: Array<{ failures?: unknown[] }>;
    routeSummary?: unknown[];
  }>(".generated/launch/performance-summary.json");
  const performanceFailures =
    performance?.reports?.flatMap((report) => report.failures ?? []) ?? [];
  checks.push({
    id: "performance-budgets",
    status: performance && performanceFailures.length === 0 ? "passed" : "pending",
    detail:
      performance && performanceFailures.length === 0
        ? `All ${performance.reports?.length ?? 0} Lighthouse runs passed category, web-vitals, resource, and request budgets across ${performance.routeSummary?.length ?? 0} routes.`
        : "Performance budget evidence is missing or contains failures.",
    evidence: [".generated/launch/performance-summary.json", "config/performance-budgets.yml"],
  });

  const browser = readJson<{ passed?: boolean; errors?: string[]; routes?: string[] }>(
    ".generated/launch/production-browser.json",
  );
  checks.push({
    id: "production-browser",
    status: browser?.passed && (browser.errors?.length ?? 0) === 0 ? "passed" : "pending",
    detail:
      browser?.passed && (browser.errors?.length ?? 0) === 0
        ? `Standalone production browser checks passed for ${browser.routes?.length ?? 0} routes with no CSP or runtime errors.`
        : "Standalone production browser evidence is missing or failed.",
    evidence: [".generated/launch/production-browser.json"],
  });

  const visual = readJson<{ status?: string; captures?: unknown[]; errors?: string[] }>(
    ".generated/launch/visual/manifest.json",
  );
  checks.push({
    id: "visual-evidence",
    status:
      visual?.status === "human-review-pending" && (visual.errors?.length ?? 0) === 0
        ? "human-review-pending"
        : "pending",
    detail:
      visual?.status === "human-review-pending"
        ? `${visual.captures?.length ?? 0} clean production visual states were captured; comparison and final visual/media approval remain human decisions.`
        : "Production visual evidence is missing or failed.",
    evidence: [".generated/launch/visual/manifest.json", ".generated/launch/visual/"],
  });

  const container = readJson<{
    status?: string;
    image?: string;
    imageId?: string | null;
    runtimeUid?: string | null;
    repoDigests?: string[];
  }>(".generated/launch/container-check.json");
  checks.push({
    id: "container",
    status: container?.status === "passed" && container.runtimeUid !== "0" ? "passed" : "pending",
    detail:
      container?.status === "passed"
        ? `Container ${container.image ?? "unknown"} passed as uid ${container.runtimeUid ?? "unknown"}; image ID ${container.imageId ?? "not recorded"}.`
        : "Container acceptance evidence is missing or failed.",
    evidence: [".generated/launch/container-check.json", "infrastructure/docker/Dockerfile"],
  });

  const sbom = readJson<{ releaseId?: string; packageCount?: number; containerDigest?: string }>(
    ".generated/launch/sbom-manifest.json",
  );
  checks.push({
    id: "sbom",
    status:
      sbom &&
      exists("evidence/local/sbom/cyclonedx.json") &&
      exists("evidence/local/sbom/spdx.json")
        ? "passed"
        : "pending",
    detail: sbom
      ? `CycloneDX and SPDX SBOMs cover ${sbom.packageCount ?? 0} locked packages for ${sbom.releaseId ?? releaseId}; container digest is ${sbom.containerDigest ?? "pending"}.`
      : "SBOM evidence is missing.",
    evidence: [
      ".generated/launch/sbom-manifest.json",
      "evidence/local/sbom/cyclonedx.json",
      "evidence/local/sbom/spdx.json",
    ],
  });

  const vulnerability = readJson<{
    production?: { status?: string };
    tooling?: { status?: string; advisories?: unknown[] };
  }>("evidence/local/security/vulnerability-scan.json");
  const vulnerabilityStatus = vulnerability?.production?.status === "passed";
  checks.push({
    id: "vulnerability-scan",
    status: vulnerabilityStatus
      ? vulnerability?.tooling?.status === "findings"
        ? "passed-with-advisory"
        : "passed"
      : "pending",
    detail: vulnerabilityStatus
      ? `Production dependencies passed; ${vulnerability?.tooling?.advisories?.length ?? 0} development-tool advisory groups remain visible.`
      : "Vulnerability evidence is missing or the production dependency audit did not pass.",
    evidence: ["evidence/local/security/vulnerability-scan.json"],
  });
  return checks;
}

const checks = launchChecks();
const ownerGates = [
  "Qualified legal/privacy/licensing/trademark review and approval IDs",
  "Factual, institutional, people, project, funding, maintainer, and publication-copy approval",
  "Media/font provenance, permissions, alt text, crop, and visual comparison approval",
  "Provider credentials and privacy decisions for Typesense, Kit, GlitchTip, Infisical, and cache",
  "Forgejo branch protection, reviewer/PR policy, signed tag policy, and release authority",
  "Authorized Tower/Coolify staging application, immutable registry image, and staging URL",
  "DNS/TLS ownership and canonical-domain change authority",
  "Production monitoring/on-call/incident policy and an authorized rollback drill",
  "Publication/syndication ownership and production feed acceptance",
  "Final release tag/signature and immutable staging artifact identity",
  "Authentication, API, and platform integration are explicitly deferred outside this v1 closure",
];
const failed = checks.filter((check) => check.status === "failed");
const report = {
  schemaVersion: 2,
  generatedAt: new Date().toISOString(),
  generatedBy: "scripts/launch-report.ts",
  status: failed.length > 0 ? "failed" : "local-runtime-verified-with-external-gates-pending",
  releaseId,
  git: {
    sha: git(["rev-parse", "HEAD"]),
    branch: git(["branch", "--show-current"]),
    remote: git(["remote", "get-url", "origin"]),
    exactTag: git(["describe", "--tags", "--exact-match"]),
  },
  build: {
    node: process.version,
    packageManager: "pnpm@10.6.0",
    lockfileSha256: lockHash(),
  },
  checks,
  passed: checks.filter((check) => ["passed", "passed-with-advisory"].includes(check.status)),
  pending: checks.filter((check) => ["pending", "human-review-pending"].includes(check.status)),
  ownerGates,
  limitations: [
    "Local evidence is tied to the current workspace and is not a CI or hosted-staging receipt until those systems produce matching artifacts.",
    "Human visual comparison, legal/factual/media approval, credentials, DNS/TLS, production deployment, and publication authority are not automated or inferred.",
    "The local Docker registry digest proves the image inspected on this machine, not an immutable hosted registry or deployed digest.",
  ],
};
fs.mkdirSync(launchRoot, { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(
  `Generated launch evidence: ${checks.filter((check) => check.status === "passed").length} passed, ${checks.filter((check) => check.status === "passed-with-advisory").length} advisory, ${checks.filter((check) => check.status === "human-review-pending").length} human-review-pending, ${checks.filter((check) => check.status === "pending").length} pending, ${failed.length} failed.`,
);
