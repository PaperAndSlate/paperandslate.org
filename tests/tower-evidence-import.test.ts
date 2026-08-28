import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { towerRequirementOverrides, type TowerEvidence } from "../scripts/tower-evidence-import";

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
    expect(overrides["WEB-REQ-0005"]).toMatchObject({
      status: "verified-ci",
      evidenceUpdatedAt: capturedAt,
    });
  });
});
