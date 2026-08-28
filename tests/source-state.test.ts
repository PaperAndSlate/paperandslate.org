import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  classifySourceWorktree,
  normalizeGitStatus,
  sourceRevisionMatchesCurrent,
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

  it("accepts only a generated traceability descendant as the same source", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "paper-and-slate-source-state-"));
    const git = (...args: string[]) =>
      execFileSync(process.platform === "win32" ? "git.exe" : "git", args, {
        cwd: root,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim();
    try {
      git("init", "--quiet");
      git("config", "user.email", "test@example.invalid");
      git("config", "user.name", "Source state test");
      fs.writeFileSync(path.join(root, "README.md"), "base\n");
      git("add", "README.md");
      git("commit", "--quiet", "-m", "base");
      const base = git("rev-parse", "HEAD");

      fs.mkdirSync(path.join(root, ".generated", "requirements"), { recursive: true });
      fs.writeFileSync(
        path.join(root, ".generated", "requirements", "traceability-check.json"),
        "{}\n",
      );
      git("add", ".generated/requirements/traceability-check.json");
      git("commit", "--quiet", "-m", "generated evidence");
      const generatedHead = git("rev-parse", "HEAD");
      expect(sourceRevisionMatchesCurrent(root, base, base)).toBe(true);
      expect(sourceRevisionMatchesCurrent(root, base, generatedHead)).toBe(true);

      fs.writeFileSync(path.join(root, "source.ts"), "export {};\n");
      git("add", "source.ts");
      git("commit", "--quiet", "-m", "authored change");
      expect(sourceRevisionMatchesCurrent(root, base, git("rev-parse", "HEAD"))).toBe(false);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
