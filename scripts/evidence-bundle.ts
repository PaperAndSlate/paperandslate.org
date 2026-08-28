import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { classifySourceWorktree } from "./source-state";

const root = process.cwd();
const releaseId = (
  process.env.RELEASE_ID || `local-rc-${new Date().toISOString().slice(0, 10)}`
).replace(/[^A-Za-z0-9._-]/g, "-");
const generatedEvidenceRoot = path.resolve(root, ".generated", "evidence");
const bundleRoot = path.resolve(generatedEvidenceRoot, releaseId);
if (!bundleRoot.startsWith(`${generatedEvidenceRoot}${path.sep}`))
  throw new Error(`Refusing to write evidence outside ${generatedEvidenceRoot}`);

const git = (args: string[]) => {
  try {
    return execFileSync(process.platform === "win32" ? "git.exe" : "git", args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trimEnd();
  } catch {
    return null;
  }
};
const sourceSha = git(["rev-parse", "HEAD"]);
const sourceStatus = git(["status", "--porcelain", "--untracked-files=all"]);
const sourceWorktree = classifySourceWorktree(sourceStatus);
const configuredCandidateSha = process.env.CANDIDATE_SHA || process.env.GIT_SHA || null;
const candidateSha = configuredCandidateSha || sourceSha;
const strictIdentity = Boolean(process.env.CANDIDATE_SHA) || /^v1\.0\.0-rc\./.test(releaseId);
const readJson = <T>(relative: string): T | null => {
  const file = path.join(root, relative);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as T;
  } catch {
    return null;
  }
};
const copyIfPresent = (source: string, destination: string) => {
  const absoluteSource = path.resolve(root, source);
  if (!absoluteSource.startsWith(`${root}${path.sep}`) || !fs.existsSync(absoluteSource))
    return false;
  const absoluteDestination = path.resolve(bundleRoot, destination);
  if (!absoluteDestination.startsWith(`${bundleRoot}${path.sep}`))
    throw new Error(`Refusing to write evidence outside bundle: ${destination}`);
  fs.mkdirSync(path.dirname(absoluteDestination), { recursive: true });
  fs.cpSync(absoluteSource, absoluteDestination, { recursive: true });
  return true;
};
const sha256File = (file: string) =>
  createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const lockfile = path.join(root, "pnpm-lock.yaml");
const lockfileSha256 = fs.existsSync(lockfile) ? sha256File(lockfile) : null;

const sources = [
  [".generated/requirements/requirements.json", "traceability/requirements.json"],
  [".generated/requirements/traceability-check.json", "traceability/traceability-check.json"],
  ["IMPLEMENTATION_LEDGER.md", "traceability/IMPLEMENTATION_LEDGER.md"],
  [".generated/docs", "content/generated-docs"],
  [".generated/search", "search/generated"],
  [".generated/launch/lighthouse", "launch/lighthouse"],
  [".generated/launch/performance-summary.json", "launch/performance-summary.json"],
  [".generated/launch/production-browser.json", "launch/production-browser.json"],
  [".generated/launch/visual", "launch/visual"],
  [".generated/launch/lighthouse-staging", "launch/lighthouse-staging"],
  [".generated/launch/staging-publication.json", "launch/staging-publication.json"],
  [".generated/launch/container-check.json", "launch/container-check.json"],
  [".generated/launch/docs-bundle-check.json", "launch/docs-bundle-check.json"],
  [".generated/launch/sbom-manifest.json", "launch/sbom-manifest.json"],
  [".generated/launch/verify.json", "launch/verify.json"],
  [".generated/launch/reproducibility.json", "launch/reproducibility.json"],
  [".generated/launch/package-smoke.json", "packages/package-smoke.json"],
  [".generated/launch/repository-identity.json", "launch/repository-identity.json"],
  [".generated/launch/launch-evidence.json", "launch/launch-evidence.json"],
  ["evidence/local/sbom", "supply-chain/sbom"],
  ["evidence/local/security", "supply-chain/security"],
  ["playwright-report", "browser/playwright-report"],
  ["test-results", "browser/test-results"],
] as const;

fs.rmSync(bundleRoot, { recursive: true, force: true });
fs.mkdirSync(bundleRoot, { recursive: true });
const includedEvidence = sources
  .filter(([source, destination]) => copyIfPresent(source, destination))
  .map(([source, destination]) => ({ source, destination }));

const pending = {
  status: "pending-owner-or-external-evidence",
  approvals: [
    "qualified legal/privacy/licensing/trademark review and approval IDs",
    "factual, institutional, people, project, funding, maintainer, and publication-copy approval",
    "media/font provenance, permissions, alt text, crop, and human visual comparison approval",
  ],
  authority: [
    "Forgejo branch protection, reviewer/PR, tag-signing, and release authority",
    "DNS/TLS and canonical-domain authority",
    "Tower/Coolify staging and production deployment authority",
    "provider credentials and production monitoring/rollback authority",
  ],
  publication: [
    "publication and corrections workflow owner",
    "syndication destination authority",
    "production feed acceptance",
  ],
  explicitlyDeferred: [
    "authentication, API, and platform integration work remains outside v1 closure scope",
    "public GitHub publication, production deployment, and final v1.0.0 release are not authorized",
  ],
};
fs.mkdirSync(path.join(bundleRoot, "approvals"), { recursive: true });
fs.writeFileSync(
  path.join(bundleRoot, "approvals", "pending.json"),
  `${JSON.stringify(pending, null, 2)}\n`,
);

const launch = readJson<{ status?: string; checks?: Array<{ id?: string; status?: string }> }>(
  ".generated/launch/launch-evidence.json",
);
const container = readJson<{
  status?: string;
  gitSha?: string;
  imageId?: string | null;
  repoDigests?: string[];
}>(".generated/launch/container-check.json");
const visual = readJson<{ status?: string; gitSha?: string; captures?: unknown[] }>(
  ".generated/launch/visual/manifest.json",
);
const verify = readJson<{ status?: string; completed?: string[]; gitSha?: string | null }>(
  ".generated/launch/verify.json",
);
const sbom = readJson<{ gitSha?: string; containerDigest?: string }>(
  ".generated/launch/sbom-manifest.json",
);
const hostedLighthouse = readJson<{
  status?: string;
  gitSha?: string;
  deploymentId?: string | null;
  lighthouseVersion?: string;
}>(".generated/launch/lighthouse-staging/lighthouse-run.json");
const publication = readJson<{
  status?: string;
  gitSha?: string;
  deploymentId?: string | null;
}>(".generated/launch/staging-publication.json");
const identityMismatches: string[] = [];
const requireIdentity = (label: string, value: string | null | undefined) => {
  if (strictIdentity && !value) identityMismatches.push(`${label} identity is missing`);
  if (value && candidateSha && value !== candidateSha)
    identityMismatches.push(`${label}=${value} does not match candidate SHA ${candidateSha}`);
};
if (!sourceSha) identityMismatches.push("local Git HEAD is unavailable");
if (configuredCandidateSha && !/^[a-f0-9]{40}$/i.test(configuredCandidateSha))
  identityMismatches.push(
    `configured candidate SHA is not a full Git SHA: ${configuredCandidateSha}`,
  );
requireIdentity("source", sourceSha);
requireIdentity("verify", verify?.gitSha);
requireIdentity("container", container?.gitSha);
requireIdentity("SBOM", sbom?.gitSha);
requireIdentity("hosted Lighthouse", hostedLighthouse?.gitSha);
requireIdentity("publication", publication?.gitSha);
requireIdentity("visual", visual?.gitSha);
if (strictIdentity && !hostedLighthouse?.deploymentId)
  identityMismatches.push("hosted Lighthouse deployment identity is missing");
if (strictIdentity && !publication?.deploymentId)
  identityMismatches.push("publication deployment identity is missing");
const containerDigest = container?.repoDigests?.[0] || container?.imageId || null;
if (sbom?.containerDigest && sbom.containerDigest !== "pending" && containerDigest) {
  const sbomDigest = sbom.containerDigest;
  if (sbomDigest !== containerDigest)
    identityMismatches.push(
      `SBOM container digest ${sbomDigest} does not match container evidence ${containerDigest}`,
    );
}
if (
  process.env.CONTAINER_IMAGE_DIGEST &&
  sbom?.containerDigest &&
  sbom.containerDigest !== "pending" &&
  process.env.CONTAINER_IMAGE_DIGEST !== sbom.containerDigest
)
  identityMismatches.push(
    `configured container digest ${process.env.CONTAINER_IMAGE_DIGEST} does not match SBOM ${sbom.containerDigest}`,
  );
if (strictIdentity && !sourceWorktree.clean)
  identityMismatches.push(
    sourceWorktree.available
      ? `strict candidate evidence requires a clean authored source worktree${sourceWorktree.dirtyPaths.length ? `; dirty paths: ${sourceWorktree.dirtyPaths.join(", ")}` : ""}`
      : "strict candidate evidence requires Git worktree status to be available",
  );
const manifest = {
  schemaVersion: 2,
  status:
    identityMismatches.length > 0
      ? "incomplete-identity-mismatch"
      : "local-release-candidate-evidence",
  releaseId,
  generatedAt: new Date().toISOString(),
  identity: {
    strict: strictIdentity,
    candidateSha,
    sourceSha,
    mismatches: identityMismatches,
  },
  source: {
    sha: sourceSha,
    branch: git(["branch", "--show-current"]),
    remote: git(["remote", "get-url", "origin"]),
    exactTag: git(["describe", "--tags", "--exact-match"]),
    worktreeClean: sourceWorktree.clean,
    worktreeStatusAvailable: sourceWorktree.available,
    dirtyPaths: sourceWorktree.dirtyPaths,
  },
  build: {
    node: process.version,
    packageManager: "pnpm@10.6.0",
    lockfileSha256,
  },
  verification: {
    launchReportStatus: launch?.status ?? "missing",
    fullVerifyStatus: verify?.status ?? "missing",
    fullVerifyTasks: verify?.completed?.length ?? 0,
    visualStatus: visual?.status ?? "missing",
    visualCaptures: visual?.captures?.length ?? 0,
    hostedLighthouseStatus: hostedLighthouse ? "present" : "missing",
    hostedLighthouseVersion: hostedLighthouse?.lighthouseVersion ?? null,
    publicationStatus: publication ? "present" : "missing",
  },
  artifact: {
    localImageId: container?.imageId ?? null,
    localImageRepoDigests: container?.repoDigests ?? [],
    hostedRegistryDigest: process.env.CONTAINER_IMAGE_DIGEST || null,
    stagingUrl: process.env.STAGING_URL || null,
    deploymentId: process.env.STAGING_DEPLOYMENT_ID || null,
  },
  providers: {
    search: {
      configured: process.env.SEARCH_PROVIDER === "typesense",
      indexId: process.env.TYPESENSE_INDEX_ID || "static-local",
    },
    newsletter: {
      configured: process.env.KIT_ENABLED === "true" && Boolean(process.env.KIT_FORM_ID),
    },
    errorTracking: { configured: Boolean(process.env.GLITCHTIP_DSN) },
    cache: { configured: Boolean(process.env.VALKEY_URL) },
  },
  includedEvidence,
  pending,
};
fs.writeFileSync(path.join(bundleRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

const hashes: Record<string, { sha256: string; bytes: number }> = {};
const hashTree = (directory: string) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    const relative = path.relative(bundleRoot, absolute).replaceAll(path.sep, "/");
    if (entry.isDirectory()) hashTree(absolute);
    else if (!["manifest.json", "hashes.json", "manifest.sha256"].includes(relative)) {
      hashes[relative] = { sha256: sha256File(absolute), bytes: fs.statSync(absolute).size };
    }
  }
};
hashTree(bundleRoot);
fs.writeFileSync(path.join(bundleRoot, "hashes.json"), `${JSON.stringify(hashes, null, 2)}\n`);
fs.writeFileSync(
  path.join(bundleRoot, "manifest.sha256"),
  `${sha256File(path.join(bundleRoot, "manifest.json"))}\n`,
);
if (strictIdentity && identityMismatches.length > 0)
  throw new Error(`Evidence identity mismatch: ${identityMismatches.join("; ")}`);
console.log(
  `Created release evidence bundle ${path.relative(root, bundleRoot)} with ${Object.keys(hashes).length} hashed files.`,
);
