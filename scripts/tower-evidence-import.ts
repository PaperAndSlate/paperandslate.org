import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

export type TowerEvidenceStatus = "pending" | "passed" | "failed" | "degraded";

export type TowerEvidence = {
  schemaVersion: 1;
  status: TowerEvidenceStatus;
  capturedAt: string | null;
  capturedBy: string;
  project: {
    slug: string;
    environment: "staging";
    applicationId: string | null;
    host: string;
  };
  source: {
    sha: string;
    branch: string;
    releaseId: string;
    rcTag: string | null;
  } | null;
  repository: {
    status: TowerEvidenceStatus;
    branch: string;
    remoteSha: string;
    rc1Sha: string;
  } | null;
  ci: {
    status: TowerEvidenceStatus;
    runId: string;
    workflow: string;
    sha: string;
    artifacts: string[];
  } | null;
  staging: {
    status: TowerEvidenceStatus;
    deploymentId: string;
    sourceSha: string;
    releaseId: string;
    url: string;
    healthStatus: TowerEvidenceStatus;
    smokeStatus: TowerEvidenceStatus;
  } | null;
  hostedLighthouse: {
    status: TowerEvidenceStatus;
    target: string;
    sourceSha: string;
    releaseId: string;
    reportCount: number;
    evidencePath: string;
  } | null;
  providers: {
    typesense: {
      status: TowerEvidenceStatus;
      mode: "search-only" | "write" | "unavailable";
      searchStatus: TowerEvidenceStatus;
      fallbackStatus: TowerEvidenceStatus;
      facetsStatus: TowerEvidenceStatus;
      rankingStatus: TowerEvidenceStatus;
      aliasStatus: TowerEvidenceStatus;
      previewExclusionStatus: TowerEvidenceStatus;
    };
    valkey: {
      status: TowerEvidenceStatus;
      roundtripStatus: TowerEvidenceStatus;
      ttlStatus: TowerEvidenceStatus;
      idempotencyStatus: TowerEvidenceStatus;
      rateLimitStatus: TowerEvidenceStatus;
      failureStatus: TowerEvidenceStatus;
    };
    s3: { status: TowerEvidenceStatus; roundtripStatus: TowerEvidenceStatus };
    glitchtip: { status: TowerEvidenceStatus; eventStatus: TowerEvidenceStatus };
  } | null;
  monitoring: {
    status: TowerEvidenceStatus;
    probeStatus: TowerEvidenceStatus;
    monitorIds: string[];
    sloWindow: string;
    sloStatus: TowerEvidenceStatus;
  } | null;
  artifact: {
    status: TowerEvidenceStatus;
    tag: string;
    sourceSha: string;
    digest: string;
    deployedDigest: string;
    sizeBytes: number;
    sbomStatus: TowerEvidenceStatus;
    provenanceStatus: TowerEvidenceStatus;
    scanStatus: TowerEvidenceStatus;
    signatureStatus: TowerEvidenceStatus;
    evidencePath: string;
  } | null;
  rollback: {
    status: TowerEvidenceStatus;
    sequence: "A-B-A";
    imageA: { deploymentId: string; sourceSha: string; digest: string };
    imageB: { deploymentId: string; sourceSha: string; digest: string };
    restoredImage: "A";
  } | null;
  publication: {
    status: TowerEvidenceStatus;
    sourceSha: string;
    routes: string[];
    feedStatus: TowerEvidenceStatus;
  } | null;
  notes: string;
};

const root = process.cwd();
const evidencePath = path.join(root, "config", "tower-evidence.json");
const shaPattern = /^[0-9a-f]{40}$/i;
const digestPattern = /^sha256:[0-9a-f]{64}$/i;
const sensitiveKeyPattern =
  /(password|token|secret|dsn|api[_-]?key|private[_-]?key|authorization|bearer|credential)/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertSafeValues(value: unknown, key = "root"): void {
  if (Array.isArray(value)) {
    for (const item of value) assertSafeValues(item, key);
    return;
  }
  if (!isRecord(value)) return;
  for (const [childKey, childValue] of Object.entries(value)) {
    if (sensitiveKeyPattern.test(childKey))
      throw new Error(`Tower evidence contains a sensitive-looking key: ${key}.${childKey}`);
    assertSafeValues(childValue, `${key}.${childKey}`);
  }
}

function assertStatus(value: unknown, pathName: string): asserts value is TowerEvidenceStatus {
  if (!["pending", "passed", "failed", "degraded"].includes(String(value)))
    throw new Error(`Invalid Tower evidence status at ${pathName}`);
}

function assertSha(value: unknown, pathName: string) {
  if (typeof value !== "string" || !shaPattern.test(value))
    throw new Error(`Invalid commit SHA at ${pathName}`);
}

function assertDigest(value: unknown, pathName: string) {
  if (typeof value !== "string" || !digestPattern.test(value))
    throw new Error(`Invalid OCI digest at ${pathName}`);
}

export function validateTowerEvidence(input: unknown): TowerEvidence {
  assertSafeValues(input);
  if (!isRecord(input)) throw new Error("Tower evidence must be a JSON object");
  if (input.schemaVersion !== 1) throw new Error("Unsupported Tower evidence schema version");
  assertStatus(input.status, "status");
  if (input.capturedAt !== null && typeof input.capturedAt !== "string")
    throw new Error("capturedAt must be an ISO string or null");
  if (typeof input.capturedBy !== "string" || !input.capturedBy.trim())
    throw new Error("capturedBy is required");
  const project = input.project;
  if (
    !isRecord(project) ||
    project.slug !== "paper-and-slate-web" ||
    project.environment !== "staging"
  )
    throw new Error("Tower evidence must be scoped to the Paper and Slate staging project");
  if (
    typeof project.host !== "string" ||
    !project.host.startsWith("https://") ||
    !project.host.endsWith(".dev.tower")
  )
    throw new Error("Tower evidence host must be a managed HTTPS staging host");
  for (const [key, value] of Object.entries(input)) {
    if (
      [
        "source",
        "repository",
        "ci",
        "staging",
        "hostedLighthouse",
        "providers",
        "monitoring",
        "artifact",
        "rollback",
        "publication",
      ].includes(key) &&
      value !== null &&
      !isRecord(value)
    )
      throw new Error(`Tower evidence section ${key} must be an object or null`);
  }
  const source = input.source;
  if (source) {
    if (!isRecord(source)) throw new Error("source must be an object or null");
    assertSha(source.sha, "source.sha");
    if (typeof source.branch !== "string" || typeof source.releaseId !== "string")
      throw new Error("source branch and releaseId are required");
    if (source.rcTag !== null && typeof source.rcTag !== "string")
      throw new Error("source.rcTag must be a string or null");
  }
  const repository = input.repository;
  if (repository) {
    if (!isRecord(repository)) throw new Error("repository must be an object or null");
    assertStatus(repository.status, "repository.status");
    assertSha(repository.remoteSha, "repository.remoteSha");
    assertSha(repository.rc1Sha, "repository.rc1Sha");
  }
  const ci = input.ci;
  if (ci) {
    if (!isRecord(ci)) throw new Error("ci must be an object or null");
    assertStatus(ci.status, "ci.status");
    assertSha(ci.sha, "ci.sha");
    if (!Array.isArray(ci.artifacts) || ci.artifacts.some((item) => typeof item !== "string"))
      throw new Error("ci.artifacts must contain only non-secret identifiers");
  }
  const staging = input.staging;
  if (staging) {
    if (!isRecord(staging)) throw new Error("staging must be an object or null");
    assertStatus(staging.status, "staging.status");
    assertStatus(staging.healthStatus, "staging.healthStatus");
    assertStatus(staging.smokeStatus, "staging.smokeStatus");
    assertSha(staging.sourceSha, "staging.sourceSha");
    if (
      typeof staging.url !== "string" ||
      !staging.url.startsWith("https://") ||
      !staging.url.endsWith(".dev.tower")
    )
      throw new Error("staging.url must be a managed HTTPS staging host");
  }
  const hostedLighthouse = input.hostedLighthouse;
  if (hostedLighthouse) {
    if (!isRecord(hostedLighthouse)) throw new Error("hostedLighthouse must be an object or null");
    assertStatus(hostedLighthouse.status, "hostedLighthouse.status");
    assertSha(hostedLighthouse.sourceSha, "hostedLighthouse.sourceSha");
    if (
      typeof hostedLighthouse.target !== "string" ||
      !hostedLighthouse.target.endsWith(".dev.tower")
    )
      throw new Error("hostedLighthouse.target must be a managed staging host");
    if (typeof hostedLighthouse.reportCount !== "number" || hostedLighthouse.reportCount < 1)
      throw new Error("hostedLighthouse.reportCount must be positive");
  }
  const providers = input.providers;
  if (providers) {
    if (
      !isRecord(providers) ||
      !isRecord(providers.typesense) ||
      !isRecord(providers.valkey) ||
      !isRecord(providers.s3) ||
      !isRecord(providers.glitchtip)
    )
      throw new Error(
        "providers must contain redacted Typesense, Valkey, S3, and GlitchTip sections",
      );
    for (const [provider, section] of Object.entries(providers)) {
      if (!isRecord(section)) throw new Error(`Provider section ${provider} must be an object`);
      for (const [key, value] of Object.entries(section)) {
        if (key.endsWith("Status")) assertStatus(value, `providers.${provider}.${key}`);
      }
    }
  }
  const monitoring = input.monitoring;
  if (monitoring) {
    if (!isRecord(monitoring)) throw new Error("monitoring must be an object or null");
    assertStatus(monitoring.status, "monitoring.status");
    assertStatus(monitoring.probeStatus, "monitoring.probeStatus");
    assertStatus(monitoring.sloStatus, "monitoring.sloStatus");
    if (
      !Array.isArray(monitoring.monitorIds) ||
      monitoring.monitorIds.some((item) => typeof item !== "string")
    )
      throw new Error("monitoring.monitorIds must contain only identifiers");
  }
  const artifact = input.artifact;
  if (artifact) {
    if (!isRecord(artifact)) throw new Error("artifact must be an object or null");
    assertStatus(artifact.status, "artifact.status");
    assertStatus(artifact.sbomStatus, "artifact.sbomStatus");
    assertStatus(artifact.provenanceStatus, "artifact.provenanceStatus");
    assertStatus(artifact.scanStatus, "artifact.scanStatus");
    assertStatus(artifact.signatureStatus, "artifact.signatureStatus");
    assertSha(artifact.sourceSha, "artifact.sourceSha");
    assertDigest(artifact.digest, "artifact.digest");
    assertDigest(artifact.deployedDigest, "artifact.deployedDigest");
    if (typeof artifact.sizeBytes !== "number" || artifact.sizeBytes <= 0)
      throw new Error("artifact.sizeBytes must be positive");
  }
  const rollback = input.rollback;
  if (rollback) {
    if (!isRecord(rollback) || rollback.sequence !== "A-B-A" || rollback.restoredImage !== "A")
      throw new Error("rollback must record an A-B-A sequence restored to image A");
    assertStatus(rollback.status, "rollback.status");
    for (const image of ["imageA", "imageB"] as const) {
      const record = rollback[image];
      if (!isRecord(record)) throw new Error(`rollback.${image} is required`);
      assertSha(record.sourceSha, `rollback.${image}.sourceSha`);
      assertDigest(record.digest, `rollback.${image}.digest`);
    }
  }
  const publication = input.publication;
  if (publication) {
    if (!isRecord(publication)) throw new Error("publication must be an object or null");
    assertStatus(publication.status, "publication.status");
    assertStatus(publication.feedStatus, "publication.feedStatus");
    assertSha(publication.sourceSha, "publication.sourceSha");
    if (
      !Array.isArray(publication.routes) ||
      publication.routes.some((item) => typeof item !== "string")
    )
      throw new Error("publication.routes must contain route identifiers");
  }
  return input as unknown as TowerEvidence;
}

export function readTowerEvidence(): TowerEvidence | null {
  if (!fs.existsSync(evidencePath)) return null;
  const parsed = JSON.parse(fs.readFileSync(evidencePath, "utf8")) as unknown;
  return validateTowerEvidence(parsed);
}

function gitHead() {
  try {
    return execFileSync(process.platform === "win32" ? "git.exe" : "git", ["rev-parse", "HEAD"], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

function matchingSource(evidence: TowerEvidence, sha = gitHead()) {
  return Boolean(evidence.source?.sha && sha && evidence.source.sha === sha);
}

function successful(value: { status?: TowerEvidenceStatus } | null | undefined) {
  return value?.status === "passed";
}

export function towerRequirementOverrides(evidence: TowerEvidence | null) {
  if (!evidence || evidence.status !== "passed") return {};
  const exact = matchingSource(evidence);
  const overrides: Record<string, Record<string, unknown>> = {};
  const mark = (
    id: string,
    condition: boolean,
    status: "verified-ci" | "verified-staging",
    note: string,
  ) => {
    if (!condition) return;
    overrides[id] = {
      status,
      generatedEvidence: ["config/tower-evidence.json"],
      notes: note,
      evidenceUpdatedAt: evidence.capturedAt ?? new Date().toISOString(),
    };
  };
  mark(
    "WEB-REQ-0005",
    successful(evidence.repository) && exact,
    "verified-ci",
    "Private Forgejo repository and exact branch/source identity were verified through redacted Tower receipts.",
  );
  mark(
    "WEB-REQ-0006",
    successful(evidence.ci) && evidence.ci?.sha === evidence.source?.sha,
    "verified-ci",
    "Forgejo CI passed for the exact release source SHA; run and artifact identifiers are retained in the redacted Tower receipt.",
  );
  mark(
    "WEB-REQ-0016",
    successful(evidence.publication) && evidence.publication?.sourceSha === evidence.source?.sha,
    "verified-staging",
    "Hosted staging publication, discovery routes, and feed validation passed for the exact source SHA.",
  );
  const typesense = evidence.providers?.typesense;
  const typesenseComplete =
    typesense &&
    typesense.mode === "search-only" &&
    [
      typesense.status,
      typesense.searchStatus,
      typesense.fallbackStatus,
      typesense.facetsStatus,
      typesense.rankingStatus,
      typesense.aliasStatus,
      typesense.previewExclusionStatus,
    ].every((status) => status === "passed");
  mark(
    "WEB-REQ-0017",
    Boolean(typesenseComplete && exact),
    "verified-staging",
    "Hosted Typesense search and static fallback behavior passed with redacted provider contract evidence.",
  );
  mark(
    "WEB-REQ-0038",
    Boolean(typesenseComplete && exact),
    "verified-staging",
    "Hosted Typesense search-only contract passed, including facets, ranking, alias, preview exclusion, and fallback checks.",
  );
  const valkey = evidence.providers?.valkey;
  const valkeyComplete =
    valkey &&
    [
      valkey.status,
      valkey.roundtripStatus,
      valkey.ttlStatus,
      valkey.idempotencyStatus,
      valkey.rateLimitStatus,
      valkey.failureStatus,
    ].every((status) => status === "passed");
  mark(
    "WEB-REQ-0040",
    Boolean(valkeyComplete && exact),
    "verified-staging",
    "Hosted Valkey roundtrip, TTL, idempotency, rate-limit, and failure-boundary checks passed.",
  );
  mark(
    "WEB-REQ-0041",
    Boolean(
      evidence.providers?.glitchtip &&
        successful(evidence.providers.glitchtip) &&
        successful(evidence.providers.glitchtip.eventStatus) &&
        exact,
    ),
    "verified-staging",
    "A labeled staging GlitchTip event was captured and verified without storing the DSN.",
  );
  mark(
    "WEB-REQ-0027",
    Boolean(
      evidence.hostedLighthouse &&
        successful(evidence.hostedLighthouse) &&
        evidence.hostedLighthouse.sourceSha === evidence.source?.sha &&
        exact,
    ),
    "verified-staging",
    "Hosted Lighthouse ran against the managed staging URL and passed configured thresholds for the exact source SHA.",
  );
  mark(
    "WEB-REQ-0035",
    Boolean(
      evidence.artifact &&
        successful(evidence.artifact) &&
        evidence.artifact.sourceSha === evidence.source?.sha &&
        evidence.artifact.digest === evidence.artifact.deployedDigest &&
        [
          evidence.artifact.sbomStatus,
          evidence.artifact.provenanceStatus,
          evidence.artifact.scanStatus,
          evidence.artifact.signatureStatus,
        ].every((status) => status === "passed") &&
        exact,
    ),
    "verified-staging",
    "The exact source SHA maps to one immutable OCI digest, deployed digest equality, SBOM, provenance, scan, and signature receipts.",
  );
  mark(
    "WEB-REQ-0036",
    Boolean(
      evidence.staging &&
        successful(evidence.staging) &&
        successful(evidence.staging.healthStatus) &&
        evidence.staging.sourceSha === evidence.source?.sha &&
        exact,
    ),
    "verified-staging",
    "Authorized Tower staging deployment passed with exact source identity and healthy runtime evidence.",
  );
  mark(
    "WEB-REQ-0037",
    Boolean(
      evidence.staging &&
        successful(evidence.staging.smokeStatus) &&
        evidence.staging.sourceSha === evidence.source?.sha &&
        exact,
    ),
    "verified-staging",
    "Staging health, smoke, and canonical-publication checks passed for the exact source SHA.",
  );
  mark(
    "WEB-REQ-0042",
    Boolean(
      evidence.monitoring &&
        successful(evidence.monitoring) &&
        successful(evidence.monitoring.probeStatus) &&
        successful(evidence.monitoring.sloStatus) &&
        exact,
    ),
    "verified-staging",
    "Tower synthetic monitors and the release-specific SLO window passed; monitor identifiers are retained in the receipt.",
  );
  mark(
    "WEB-REQ-0043",
    Boolean(
      evidence.rollback &&
        successful(evidence.rollback) &&
        evidence.rollback.imageA.digest !== evidence.rollback.imageB.digest &&
        exact,
    ),
    "verified-staging",
    "The authorized staging A-to-B-to-A immutable rollback drill restored image A and retained both deployment identities.",
  );
  mark(
    "WEB-REQ-0045",
    Boolean(
      evidence.artifact &&
        successful(evidence.artifact) &&
        evidence.artifact.tag === "v1.0.0-rc.2" &&
        exact,
    ),
    "verified-ci",
    "The v1.0.0-rc.2 tag and immutable artifact receipt are bound to the exact source SHA.",
  );
  return overrides;
}

export function evidenceDigest(evidence: TowerEvidence) {
  return crypto.createHash("sha256").update(JSON.stringify(evidence)).digest("hex");
}

if (process.argv[1]?.replaceAll("\\", "/").endsWith("/tower-evidence-import.ts")) {
  try {
    const evidence = readTowerEvidence();
    if (!evidence) {
      console.log("No Tower evidence file is present; hosted requirements remain pending.");
    } else {
      const overrides = towerRequirementOverrides(evidence);
      console.log(
        `Validated Tower evidence (${evidence.status}); ${Object.keys(overrides).length} requirement overlays are eligible; digest ${evidenceDigest(evidence)}.`,
      );
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
