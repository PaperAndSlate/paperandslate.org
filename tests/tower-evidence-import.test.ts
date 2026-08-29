import { execFileSync } from "node:child_process";
import { generateKeyPairSync, sign, createHash } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import {
  assertCanonicalTowerStagingOrigin,
  towerRequirementOverrides,
  towerAttestationPayload,
  type TowerEvidence,
  validateTowerEvidence,
} from "../scripts/tower-evidence-import";

function currentSha() {
  return execFileSync(process.platform === "win32" ? "git.exe" : "git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim();
}

describe("Tower evidence overlays", () => {
  it("keeps independently passed repository evidence when another section is degraded", () => {
    const capturedAt = "2026-08-28T16:00:00.000Z";
    const sha = currentSha();
    const evidence = {
      schemaVersion: 1,
      status: "degraded",
      capturedAt,
      capturedBy: "test",
      project: {
        slug: "paper-and-slate-web",
        environment: "staging",
        applicationId: null,
        host: "https://paper-and-slate-web.dev.tower",
      },
      source: {
        sha,
        branch: "release/v1-closure",
        releaseId: "v1.0.0-rc.test",
        rcTag: null,
      },
      repository: {
        status: "passed",
        branch: "release/v1-closure",
        remoteSha: sha,
        rc1Sha: sha,
      },
      ci: null,
      staging: null,
      hostedLighthouse: null,
      providers: null,
      monitoring: null,
      artifact: null,
      rollback: null,
      publication: null,
      notes: "test",
    } satisfies TowerEvidence;
    const overrides = towerRequirementOverrides(evidence);
    expect(overrides).toEqual({});
  });

  it("requires a signature from the configured trusted Tower key before applying overlays", () => {
    const sha = currentSha();
    const unsigned = {
      schemaVersion: 1,
      status: "degraded",
      capturedAt: "2026-08-28T16:00:00.000Z",
      capturedBy: "test",
      project: {
        slug: "paper-and-slate-web",
        environment: "staging",
        applicationId: null,
        host: "https://paper-and-slate-web.dev.tower",
      },
      source: { sha, branch: "release/v1-closure", releaseId: "test", rcTag: null },
      repository: {
        status: "passed",
        branch: "release/v1-closure",
        remoteSha: sha,
        rc1Sha: sha,
      },
      ci: null,
      staging: null,
      hostedLighthouse: null,
      providers: null,
      monitoring: null,
      artifact: null,
      rollback: null,
      publication: null,
      notes: "test",
    } satisfies TowerEvidence;
    const { privateKey, publicKey } = generateKeyPairSync("ed25519");
    const keyId = "tower-test-key";
    const payload = towerAttestationPayload(unsigned);
    const evidence = validateTowerEvidence({
      ...unsigned,
      attestation: {
        algorithm: "ed25519",
        keyId,
        payloadSha256: createHash("sha256").update(payload).digest("hex"),
        signature: sign(null, Buffer.from(payload), privateKey).toString("base64"),
      },
    });
    vi.stubEnv("TOWER_EVIDENCE_KEY_ID", keyId);
    vi.stubEnv(
      "TOWER_EVIDENCE_PUBLIC_KEY",
      publicKey.export({ type: "spki", format: "pem" }).toString(),
    );
    try {
      expect(towerRequirementOverrides(evidence)["WEB-REQ-0005"]).toMatchObject({
        status: "verified-ci",
      });
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("accepts only the canonical staging origin", () => {
    expect(assertCanonicalTowerStagingOrigin("https://paper-and-slate-web.dev.tower", "host")).toBe(
      "https://paper-and-slate-web.dev.tower",
    );
    expect(() => assertCanonicalTowerStagingOrigin("https://other.dev.tower", "host")).toThrow();
    expect(() =>
      assertCanonicalTowerStagingOrigin("https://user:pass@paper-and-slate-web.dev.tower", "host"),
    ).toThrow();
    expect(() =>
      assertCanonicalTowerStagingOrigin("https://paper-and-slate-web.dev.tower/redirect", "host"),
    ).toThrow();
  });

  it("rejects sibling hosts in every hosted evidence section", () => {
    const base = {
      schemaVersion: 1,
      status: "passed",
      capturedAt: null,
      capturedBy: "test",
      project: {
        slug: "paper-and-slate-web",
        environment: "staging",
        applicationId: null,
        host: "https://paper-and-slate-web.dev.tower",
      },
      source: null,
      repository: null,
      ci: null,
      staging: {
        status: "passed",
        deploymentId: "deployment",
        sourceSha: "0123456789abcdef0123456789abcdef01234567",
        releaseId: "test",
        url: "https://paper-and-slate-web.dev.tower",
        healthStatus: "passed",
        smokeStatus: "passed",
      },
      hostedLighthouse: {
        status: "passed",
        target: "https://paper-and-slate-web.dev.tower",
        sourceSha: "0123456789abcdef0123456789abcdef01234567",
        releaseId: "test",
        reportCount: 1,
        evidencePath: "evidence.json",
      },
      providers: null,
      monitoring: null,
      artifact: null,
      rollback: null,
      publication: null,
      notes: "test",
    } as const;

    expect(() =>
      validateTowerEvidence({
        ...base,
        staging: { ...base.staging, url: "https://other.dev.tower" },
      }),
    ).toThrow(/canonical HTTPS staging origin/);
    expect(() =>
      validateTowerEvidence({
        ...base,
        hostedLighthouse: { ...base.hostedLighthouse, target: "https://other.dev.tower" },
      }),
    ).toThrow(/canonical HTTPS staging origin/);
  });
});
