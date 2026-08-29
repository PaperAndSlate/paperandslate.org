import { describe, expect, it } from "vitest";
import { classifyRepositoryEvidence } from "../scripts/repository-evidence";

describe("repository evidence status", () => {
  it("keeps a clean local checkout local-only until the exact candidate is remote", () => {
    expect(
      classifyRepositoryEvidence({
        localIdentityPresent: true,
        worktreeClean: true,
        remoteResolution: "verified",
        remoteCandidateShaPresent: false,
      }),
    ).toBe("local-only");
  });

  it("passes only when the exact clean candidate is present in verified refs", () => {
    expect(
      classifyRepositoryEvidence({
        localIdentityPresent: true,
        worktreeClean: true,
        remoteResolution: "verified",
        remoteCandidateShaPresent: true,
      }),
    ).toBe("passed");
  });

  it("fails when local identity or worktree state is unavailable", () => {
    expect(
      classifyRepositoryEvidence({
        localIdentityPresent: true,
        worktreeClean: false,
        remoteResolution: "verified",
        remoteCandidateShaPresent: true,
      }),
    ).toBe("failed");
  });
});
