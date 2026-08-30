import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { hasExactCurrentSourceRevision } from "./evidence-identity";
import { sourceWorktreeClean } from "./source-state";

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

export type RequirementRecord = { status?: string; category?: string };

const acceptedRequirementStatuses = new Set([
  "verified-local",
  "verified-ci",
  "verified-staging",
  "not-applicable",
]);

export function requirementsCheckFromReport(
  report: {
    requirements?: RequirementRecord[];
  } | null,
): Check {
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
  const unresolved = substantive.filter(
    (item) => !acceptedRequirementStatuses.has(item.status ?? "unknown"),
  );
  return {
    id: "requirements",
    status: unresolved.length === 0 ? "passed" : "pending",
    detail: `${substantive.length} substantive requirements have machine-readable status; ${unresolved.length} remain unresolved (${counts.partial ?? 0} partial, ${counts["blocked-external"] ?? 0} externally blocked, ${counts["human-approval-pending"] ?? 0} require human approval).`,
    evidence: [".generated/requirements/requirements.json", "IMPLEMENTATION_LEDGER.md"],
  };
}

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

function gitStatus() {
  try {
    return execFileSync(
      process.platform === "win32" ? "git.exe" : "git",
      ["status", "--porcelain", "--untracked-files=all"],
      {
        cwd: root,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      },
    ).trimEnd();
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

function currentSourceWorktreeClean() {
  const status = gitStatus();
  return status !== null && sourceWorktreeClean(status);
}

function lockHash() {
  const file = path.join(root, "pnpm-lock.yaml");
  return fs.existsSync(file)
    ? createHash("sha256").update(fs.readFileSync(file)).digest("hex")
    : null;
}

function requirementsCheck(): Check {
  const report = readJson<{
    requirements?: RequirementRecord[];
  }>(".generated/requirements/requirements.json");
  return requirementsCheckFromReport(report);
}

function traceabilityCheck(): Check {
  const report = readJson<{
    status?: string;
    plans?: { files?: number; mappedFiles?: number; unmappedFiles?: string[] };
    requirements?: { records?: number; uniqueIds?: number };
    source?: { commit?: string; worktreeClean?: boolean };
  }>(".generated/requirements/traceability-check.json");
  const complete =
    report?.status === "passed" &&
    (report.plans?.files ?? 0) > 0 &&
    report.plans?.files === report.plans?.mappedFiles &&
    (report.plans?.unmappedFiles?.length ?? 0) === 0 &&
    (report.requirements?.records ?? 0) === report.requirements?.uniqueIds;
  const current = git(["rev-parse", "HEAD"]);
  return {
    id: "traceability",
    status:
      complete &&
      report.source?.worktreeClean === true &&
      currentSourceWorktreeClean() &&
      hasExactCurrentSourceRevision({
        evidenceRevision: report.source?.commit,
        currentRevision: current,
      })
        ? "passed"
        : "pending",
    detail: complete
      ? `Traceability covered ${report.plans?.files ?? 0} plan files and ${report.requirements?.records ?? 0} unique requirements at ${report.source?.commit ?? "unknown commit"}; source worktree is ${report.source?.worktreeClean ? "clean" : "dirty"}.`
      : "Durable traceability evidence is missing, incomplete, or not bound to a clean source worktree.",
    evidence: [
      ".generated/requirements/traceability-check.json",
      ".generated/requirements/requirements.json",
      "IMPLEMENTATION_LEDGER.md",
    ],
  };
}

function generatedCheck(id: string, relative: string, description: string): Check {
  const report = readJson<{
    status?: string;
    source?: { commit?: string; worktreeClean?: boolean };
  }>(relative);
  const current = git(["rev-parse", "HEAD"]);
  const currentIdentity = Boolean(
    report?.source?.commit &&
      current &&
      report.source.worktreeClean === true &&
      currentSourceWorktreeClean() &&
      hasExactCurrentSourceRevision({
        evidenceRevision: report.source.commit,
        currentRevision: current,
      }),
  );
  const status: CheckStatus =
    report?.status === "failed"
      ? "failed"
      : report?.status === "passed" && currentIdentity
        ? "passed"
        : "pending";
  return {
    id,
    status,
    detail:
      report?.status === "passed"
        ? `${description} Source identity ${report.source?.commit ?? "missing"}${currentIdentity ? " matches" : " does not match"} the current clean source HEAD.`
        : `${description} evidence is missing or failed.`,
    evidence: [relative],
  };
}

function launchChecks(): Check[] {
  const checks: Check[] = [
    requirementsCheck(),
    traceabilityCheck(),
    generatedCheck(
      "package-smoke",
      ".generated/launch/package-smoke.json",
      "Clean package packing, type imports, and runtime imports passed.",
    ),
    generatedCheck(
      "reproducibility",
      ".generated/launch/reproducibility.json",
      "Controlled deterministic generation passed.",
    ),
  ];
  const repository = readJson<{
    status?: string;
    gitSha?: string;
    repository?: {
      remote?: string | null;
      branch?: string | null;
      localSha?: string | null;
      worktreeClean?: boolean;
      remoteResolution?: string;
      remoteCandidateShaPresent?: boolean;
    };
  }>(".generated/launch/repository-identity.json");
  const currentSha = git(["rev-parse", "HEAD"]);
  const repositoryMatches = Boolean(
    repository?.status === "passed" &&
      currentSha &&
      repository.gitSha === currentSha &&
      repository.repository?.localSha === currentSha &&
      repository.repository?.worktreeClean === true &&
      repository.repository.remoteResolution === "verified" &&
      repository.repository.remoteCandidateShaPresent === true &&
      currentSourceWorktreeClean(),
  );
  checks.push({
    id: "repository",
    status: repositoryMatches ? "passed" : "pending",
    detail: repositoryMatches
      ? `Repository identity recorded for ${repository?.repository?.remote ?? "unknown remote"} on ${repository?.repository?.branch ?? "unknown branch"} at ${repository?.repository?.localSha ?? "unknown SHA"}; the exact candidate is present in verified remote refs.`
      : `Repository identity is local-only or historical: current HEAD is ${currentSha ?? "unknown"}, recorded SHA is ${repository?.repository?.localSha ?? "missing"}, remote resolution is ${repository?.repository?.remoteResolution ?? "unknown"}, and the candidate is ${repository?.repository?.remoteCandidateShaPresent ? "present" : "not present"} in remote refs.`,
    evidence: [".generated/launch/repository-identity.json"],
  });
  const verify = readJson<{
    status?: string;
    completed?: string[];
    skipExternal?: boolean;
    gitSha?: string | null;
    source?: { commit?: string | null; worktreeClean?: boolean };
  }>(".generated/launch/verify.json");
  const verifyIdentity = Boolean(
    verify?.gitSha &&
      verify.source?.commit &&
      verify.gitSha === verify.source.commit &&
      verify.source.worktreeClean === true &&
      currentSourceWorktreeClean() &&
      hasExactCurrentSourceRevision({
        evidenceRevision: verify.source.commit,
        currentRevision: currentSha,
      }),
  );
  const verifyDetail = verify?.skipExternal
    ? `Local verification completed ${verify.completed?.length ?? 0} tasks; external Lighthouse, performance, and vulnerability checks were intentionally skipped.`
    : `Full local verification completed ${verify?.completed?.length ?? 0} tasks, including production browser, visual capture, Lighthouse, container, SBOM, and security gates.`;
  checks.push(
    verify?.status === "passed" && verifyIdentity
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

  const docs = readJson<{
    status?: string;
    sourceBound?: string;
    missingExternalSources?: string[];
  }>(".generated/launch/docs-bundle-check.json");
  checks.push({
    id: "docs-bundle",
    status: docs?.status === "passed" && docs.sourceBound === "complete" ? "passed" : "pending",
    detail:
      docs?.status === "passed" && docs.sourceBound === "complete"
        ? "The committed generated documentation bundle is schema-, hash-, ID-, search-, and source-consistent."
        : docs?.status === "passed"
          ? `Generated documentation bundle is structurally valid but source-bound only partially; unavailable external sources: ${(docs.missingExternalSources ?? []).join(", ") || "unknown"}.`
          : "Generated documentation bundle evidence is missing or failed.",
    evidence: [
      ".generated/launch/docs-bundle-check.json",
      ".generated/docs/docs-sources.lock.json",
    ],
  });

  const lighthouse = readJson<{
    status?: string;
    gitSha?: string;
    source?: { commit?: string | null; worktreeClean?: boolean };
    reportCount?: number;
    configuredUrls?: string[];
    error?: string;
  }>(".generated/launch/lighthouse/lighthouse-run.json");
  checks.push({
    id: "lighthouse",
    status:
      lighthouse?.status === "passed" &&
      lighthouse.gitSha === lighthouse.source?.commit &&
      lighthouse.source?.worktreeClean === true &&
      currentSourceWorktreeClean() &&
      hasExactCurrentSourceRevision({
        evidenceRevision: lighthouse.source.commit,
        currentRevision: currentSha,
      })
        ? "passed"
        : lighthouse?.status === "failed"
          ? "failed"
          : "pending",
    detail:
      lighthouse?.status === "passed" &&
      lighthouse.gitSha === lighthouse.source?.commit &&
      lighthouse.source?.worktreeClean === true &&
      currentSourceWorktreeClean() &&
      hasExactCurrentSourceRevision({
        evidenceRevision: lighthouse.source.commit,
        currentRevision: currentSha,
      })
        ? `Lighthouse ran ${lighthouse.reportCount ?? 0} reports across ${lighthouse.configuredUrls?.length ?? 0} configured routes and passed configured assertions.`
        : (lighthouse?.error ?? "Lighthouse run evidence is missing."),
    evidence: [".generated/launch/lighthouse/lighthouse-run.json", ".generated/launch/lighthouse/"],
  });

  const performance = readJson<{
    source?: {
      commit?: string | null;
      worktreeClean?: boolean;
      lighthouseGitSha?: string | null;
    };
    reports?: Array<{ failures?: unknown[] }>;
    routeSummary?: unknown[];
  }>(".generated/launch/performance-summary.json");
  const performanceReports = Array.isArray(performance?.reports) ? performance.reports : [];
  const performanceFailures = performanceReports.flatMap((report) => report.failures ?? []);
  const performanceIdentity = Boolean(
    performance?.source?.commit &&
      hasExactCurrentSourceRevision({
        evidenceRevision: performance.source.commit,
        currentRevision: currentSha,
      }) &&
      performance.source.worktreeClean === true &&
      currentSourceWorktreeClean() &&
      performance.source.lighthouseGitSha === performance.source.commit,
  );
  checks.push({
    id: "performance-budgets",
    status:
      performanceReports.length > 0 &&
      Array.isArray(performance?.routeSummary) &&
      performance.routeSummary.length > 0 &&
      performanceIdentity &&
      performanceFailures.length === 0
        ? "passed"
        : "pending",
    detail:
      performanceReports.length > 0 && performanceIdentity && performanceFailures.length === 0
        ? `All ${performanceReports.length} Lighthouse runs passed category, web-vitals, resource, and request budgets across ${performance?.routeSummary?.length ?? 0} routes.`
        : "Performance budget evidence is missing or contains failures.",
    evidence: [".generated/launch/performance-summary.json", "config/performance-budgets.yml"],
  });

  const browser = readJson<{
    passed?: boolean;
    errors?: string[];
    routes?: string[];
    gitSha?: string;
    source?: { commit?: string | null; worktreeClean?: boolean };
  }>(".generated/launch/production-browser.json");
  const browserIdentity = Boolean(
    browser?.gitSha &&
      browser.gitSha === browser.source?.commit &&
      browser.source?.worktreeClean === true &&
      currentSourceWorktreeClean() &&
      hasExactCurrentSourceRevision({
        evidenceRevision: browser.source.commit,
        currentRevision: currentSha,
      }),
  );
  checks.push({
    id: "production-browser",
    status:
      browser?.passed && browserIdentity && (browser.errors?.length ?? 0) === 0
        ? "passed"
        : "pending",
    detail:
      browser?.passed && browserIdentity && (browser.errors?.length ?? 0) === 0
        ? `Standalone production browser checks passed for ${browser.routes?.length ?? 0} routes with no CSP or runtime errors.`
        : "Standalone production browser evidence is missing or failed.",
    evidence: [".generated/launch/production-browser.json"],
  });

  const visual = readJson<{
    status?: string;
    gitSha?: string;
    captures?: unknown[];
    errors?: string[];
    source?: { commit?: string | null; worktreeClean?: boolean };
  }>(".generated/launch/visual/manifest.json");
  const visualIdentity = Boolean(
    visual?.gitSha &&
      visual.gitSha === visual.source?.commit &&
      visual.source?.worktreeClean === true &&
      currentSourceWorktreeClean() &&
      hasExactCurrentSourceRevision({
        evidenceRevision: visual.source.commit,
        currentRevision: currentSha,
      }),
  );
  checks.push({
    id: "visual-evidence",
    status:
      visual?.status === "human-review-pending" &&
      visualIdentity &&
      (visual.errors?.length ?? 0) === 0
        ? "human-review-pending"
        : "pending",
    detail:
      visual?.status === "human-review-pending" && visualIdentity
        ? `${visual.captures?.length ?? 0} clean production visual states were captured; comparison and final visual/media approval remain human decisions.`
        : "Production visual evidence is missing or failed.",
    evidence: [".generated/launch/visual/manifest.json", ".generated/launch/visual/"],
  });

  const container = readJson<{
    status?: string;
    gitSha?: string;
    source?: { commit?: string | null; worktreeClean?: boolean };
    image?: string;
    imageId?: string | null;
    runtimeUid?: string | null;
    repoDigests?: string[];
  }>(".generated/launch/container-check.json");
  const containerIdentity = Boolean(
    container?.gitSha &&
      container.gitSha === container.source?.commit &&
      container.source?.worktreeClean === true &&
      currentSourceWorktreeClean() &&
      hasExactCurrentSourceRevision({
        evidenceRevision: container.source.commit,
        currentRevision: currentSha,
      }),
  );
  checks.push({
    id: "container",
    status:
      container?.status === "passed" && containerIdentity && container.runtimeUid !== "0"
        ? "passed"
        : "pending",
    detail:
      container?.status === "passed" && containerIdentity
        ? `Container ${container.image ?? "unknown"} passed as uid ${container.runtimeUid ?? "unknown"}; image ID ${container.imageId ?? "not recorded"}.`
        : "Container acceptance evidence is missing or failed.",
    evidence: [".generated/launch/container-check.json", "infrastructure/docker/Dockerfile"],
  });

  const sbom = readJson<{
    releaseId?: string;
    gitSha?: string;
    lockHash?: string;
    source?: { commit?: string | null; worktreeClean?: boolean };
    packageCount?: number;
    containerDigest?: string;
  }>(".generated/launch/sbom-manifest.json");
  const sbomIdentity = Boolean(
    sbom?.gitSha &&
      sbom.gitSha === sbom.source?.commit &&
      sbom.source?.worktreeClean === true &&
      currentSourceWorktreeClean() &&
      hasExactCurrentSourceRevision({
        evidenceRevision: sbom.source.commit,
        currentRevision: currentSha,
      }),
  );
  checks.push({
    id: "sbom",
    status:
      sbom &&
      sbomIdentity &&
      sbom.lockHash === lockHash() &&
      exists("evidence/local/sbom/cyclonedx.json") &&
      exists("evidence/local/sbom/spdx.json")
        ? "passed"
        : "pending",
    detail:
      sbom && sbomIdentity && sbom.lockHash === lockHash()
        ? `CycloneDX and SPDX SBOMs cover ${sbom.packageCount ?? 0} locked packages for ${sbom.releaseId ?? releaseId}; container digest is ${sbom.containerDigest ?? "pending"}.`
        : "SBOM evidence is missing.",
    evidence: [
      ".generated/launch/sbom-manifest.json",
      "evidence/local/sbom/cyclonedx.json",
      "evidence/local/sbom/spdx.json",
    ],
  });

  const vulnerability = readJson<{
    source?: { lockfileSha256?: string | null };
    production?: { status?: string };
    tooling?: { status?: string; advisories?: unknown[]; suppressedAdvisories?: unknown[] };
  }>("evidence/local/security/vulnerability-scan.json");
  const vulnerabilityStatus =
    vulnerability?.production?.status === "passed" &&
    vulnerability.source?.lockfileSha256 === lockHash();
  checks.push({
    id: "vulnerability-scan",
    status: vulnerabilityStatus
      ? vulnerability?.tooling?.status === "findings"
        ? "passed-with-advisory"
        : "passed"
      : "pending",
    detail: vulnerabilityStatus
      ? `Production dependencies passed; ${vulnerability?.tooling?.advisories?.length ?? 0} actionable development-tool advisory groups remain visible and ${vulnerability?.tooling?.suppressedAdvisories?.length ?? 0} are covered by tracked local patches.`
      : "Vulnerability evidence is missing or the production dependency audit did not pass.",
    evidence: ["evidence/local/security/vulnerability-scan.json"],
  });
  return checks;
}

function main() {
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
}

if (process.argv[1]?.replaceAll("\\", "/").endsWith("/launch-report.ts")) main();
