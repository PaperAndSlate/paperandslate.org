import { describe, expect, it } from "vitest";
import { sourceDirtyPaths, sourceWorktreeClean } from "../scripts/source-state";

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

  it("reports authored modifications and untracked files", () => {
    expect(sourceDirtyPaths(" M apps/web/src/page.tsx\n?? scripts/new-check.ts\n")).toEqual([
      "apps/web/src/page.tsx",
      "scripts/new-check.ts",
    ]);
  });
});
