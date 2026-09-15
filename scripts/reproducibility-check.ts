import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { preparePnpmEnv, spawnPnpmSync } from "./pnpm-command";
import { equalBytes, sha256Bytes } from "./reproducibility-core";
import { sourceDirtyPaths, sourceWorktreeClean } from "./source-state";

const root = process.cwd();
const output = path.join(root, ".generated", "search", "search-records.json");
const evidence = path.join(root, ".generated", "launch", "reproducibility.json");

export function runSearch(spawnSyncImpl: typeof spawnPnpmSync = spawnPnpmSync) {
  const result = spawnSyncImpl(["search:index"], {
    cwd: root,
    env: preparePnpmEnv({
      ...process.env,
      CI: "true",
      LANG: "C",
      LANGUAGE: "C",
      LC_ALL: "C",
      PUBLICATION_AS_OF: "2026-08-27",
      TZ: "UTC",
    }),
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });
  const stderr =
    typeof result.stderr === "string" ? result.stderr : (result.stderr?.toString() ?? "");
  if (result.error || result.status !== 0)
    throw new Error(`pnpm search:index failed: ${result.error?.message ?? stderr.trim()}`);
}

function git(args: string[]) {
  const result = spawnSync("git", args, { cwd: root, encoding: "utf8", windowsHide: true });
  if (result.error || result.status !== 0)
    throw new Error(
      `git ${args.join(" ")} failed: ${result.error?.message ?? result.stderr.trim()}`,
    );
  return result.stdout.trim();
}

function sourceStatus() {
  const result = spawnSync("git", ["status", "--porcelain", "--untracked-files=all"], {
    cwd: root,
    encoding: "utf8",
    windowsHide: true,
  });
  if (result.error || result.status !== 0)
    throw new Error(`git status failed: ${result.error?.message ?? result.stderr.trim()}`);
  return result.stdout.trimEnd();
}

function main() {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "paper-and-slate-reproducibility-"));
  try {
    runSearch();
    const first = fs.readFileSync(output);
    fs.copyFileSync(output, path.join(temporary, "first.json"));
    runSearch();
    const second = fs.readFileSync(output);
    if (!equalBytes(first, second))
      throw new Error(
        `search generation is not deterministic: ${sha256Bytes(first)} != ${sha256Bytes(second)}`,
      );
    const status = sourceStatus();
    const report = {
      schemaVersion: 1,
      status: "passed",
      generatedAt: new Date().toISOString(),
      source: {
        commit: git(["rev-parse", "HEAD"]),
        tree: git(["rev-parse", "HEAD^{tree}"]),
        lockfileSha256: sha256Bytes(fs.readFileSync(path.join(root, "pnpm-lock.yaml"))),
        worktreeClean: sourceWorktreeClean(status),
        dirtyPaths: sourceDirtyPaths(status),
      },
      output: {
        path: path.relative(root, output).replaceAll(path.sep, "/"),
        bytes: second.length,
        sha256: sha256Bytes(second),
        runs: 2,
        locale: "C",
        timezone: "UTC",
        publicationAsOf: "2026-08-27",
      },
      note: "This check compares deterministic generated search output; the Next production build remains separately covered by build:verify and hosted matrix jobs.",
    };
    fs.mkdirSync(path.dirname(evidence), { recursive: true });
    fs.writeFileSync(evidence, `${JSON.stringify(report, null, 2)}\n`);
    console.log(`Reproducibility passed: ${second.length} bytes, ${sha256Bytes(second)}`);
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  try {
    main();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    try {
      const status = sourceStatus();
      fs.mkdirSync(path.dirname(evidence), { recursive: true });
      fs.writeFileSync(
        evidence,
        `${JSON.stringify(
          {
            schemaVersion: 1,
            status: "failed",
            generatedAt: new Date().toISOString(),
            source: {
              commit: git(["rev-parse", "HEAD"]),
              tree: git(["rev-parse", "HEAD^{tree}"]),
              lockfileSha256: sha256Bytes(fs.readFileSync(path.join(root, "pnpm-lock.yaml"))),
              worktreeClean: sourceWorktreeClean(status),
              dirtyPaths: sourceDirtyPaths(status),
            },
            error: message,
          },
          null,
          2,
        )}\n`,
      );
    } catch {
      // Preserve the original reproducibility failure when evidence output is unavailable.
    }
    console.error(message);
    process.exitCode = 1;
  }
