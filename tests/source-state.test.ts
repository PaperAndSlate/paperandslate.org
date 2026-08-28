import { describe, expect, it } from "vitest";
import {
  classifySourceWorktree,
  normalizeGitStatus,
  sourceDirtyPaths,
  sourceWorktreeClean,
} from "../scripts/source-state";

describe("source worktree state", () => {
  it("preserves the leading character of status paths", () => {
    expect(sourceDirtyPaths(" M .forgejo/workflows/quality.yml\n")).toEqual([
      ".forgejo/workflows/quality.yml",
    ]);
  });

  it("ignores generated ledger and evidence paths", () => {
    expect(
      sourceWorktreeClean(
        " M IMPLEMENTATION_LEDGER.md\n?? .generated\\requirements\\traceability-check.json\n",
      ),
    ).toBe(true);
  });

  it("preserves leading porcelain columns for a generated first status line", () => {
    const status = normalizeGitStatus(
      " M .generated\\requirements\\requirements.json\n M IMPLEMENTATION_LEDGER.md\n",
    );
    expect(status).toBe(
      " M .generated\\requirements\\requirements.json\n M IMPLEMENTATION_LEDGER.md",
    );
    expect(sourceWorktreeClean(status)).toBe(true);
  });

  it("reports authored modifications and untracked files", () => {
    expect(sourceDirtyPaths(" M apps/web/src/page.tsx\n?? scripts/new-check.ts\n")).toEqual([
      "apps/web/src/page.tsx",
      "scripts/new-check.ts",
    ]);
  });

  it("distinguishes an unavailable Git status from generated-only changes", () => {
    expect(classifySourceWorktree(null)).toEqual({
      available: false,
      clean: false,
      dirtyPaths: [],
    });
    expect(
      classifySourceWorktree(
        " M IMPLEMENTATION_LEDGER.md\n?? .generated\\requirements\\requirements.json\n",
      ),
    ).toEqual({ available: true, clean: true, dirtyPaths: [] });
  });
});
