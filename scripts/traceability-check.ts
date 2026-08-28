import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { validateTraceability, type TraceabilityRecord } from "./traceability-check-core";
import { sourceDirtyPaths, sourceWorktreeClean } from "./source-state";

const root = process.cwd();
const requirementsPath = path.join(root, ".generated", "requirements", "requirements.json");
const outputPath = path.join(root, ".generated", "requirements", "traceability-check.json");

function relative(file: string) {
  return path.relative(root, file).split(path.sep).join("/");
}

function collectPlanFiles(directory: string): string[] {
  const files: string[] = [];
  const visit = (current: string) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) visit(full);
      else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md"))
        files.push(relative(full));
    }
  };
  visit(directory);
  return files.sort((a, b) => a.localeCompare(b));
}

function git(args: string[]) {
  const result = spawnSync("git", args, { cwd: root, encoding: "utf8", windowsHide: true });
  if (result.error || result.status !== 0)
    throw new Error(
      `git ${args.join(" ")} failed: ${result.error?.message ?? result.stderr.trim()}`,
    );
  return result.stdout.trim();
}

function gitStatus() {
  const result = spawnSync("git", ["status", "--porcelain", "--untracked-files=all"], {
    cwd: root,
    encoding: "utf8",
    windowsHide: true,
  });
  if (result.error || result.status !== 0)
    throw new Error(`git status failed: ${result.error?.message ?? result.stderr.trim()}`);
  return result.stdout.trimEnd();
}

function porcelainPaths(status: string) {
  return status
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.slice(3).replaceAll("\\", "/"));
}

function sha256(file: string) {
  return createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function writeAtomically(file: string, value: unknown) {
  const temporary = `${file}.tmp-${process.pid}`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  fs.renameSync(temporary, file);
}

function main() {
  if (!fs.existsSync(requirementsPath))
    throw new Error(`Missing ${relative(requirementsPath)}; run pnpm requirements:check first`);
  const parsed = JSON.parse(fs.readFileSync(requirementsPath, "utf8")) as {
    generatedAt?: string;
    requirements?: TraceabilityRecord[];
  };
  if (!Array.isArray(parsed.requirements))
    throw new Error("requirements report has no requirements array");

  const plansRoot = path.join(root, "plans");
  if (!fs.existsSync(plansRoot)) throw new Error("plans directory is missing");
  const planFiles = collectPlanFiles(plansRoot);
  const errors = validateTraceability(parsed.requirements, planFiles, root);
  const rawStatus = gitStatus();
  const dirtyPaths = sourceDirtyPaths(rawStatus);
  const worktreeClean = sourceWorktreeClean(rawStatus);
  if (process.env.TRACEABILITY_REQUIRE_CLEAN === "true" && !worktreeClean)
    errors.push("traceability requires a clean source worktree");
  if (errors.length > 0) throw new Error(`Traceability check failed:\n- ${errors.join("\n- ")}`);

  const generatedAt = new Date().toISOString();
  const result = {
    schemaVersion: 1,
    status: "passed",
    generatedAt,
    generatedBy: "pnpm traceability:check",
    source: {
      commit: git(["rev-parse", "HEAD"]),
      tree: git(["rev-parse", "HEAD^{tree}"]),
      lockfileSha256: sha256(path.join(root, "pnpm-lock.yaml")),
      worktreeClean,
      dirtyPaths,
      generatedPaths: porcelainPaths(rawStatus).filter((file) => !dirtyPaths.includes(file)),
    },
    plans: {
      files: planFiles.length,
      mappedFiles: planFiles.length,
      unmappedFiles: [],
    },
    requirements: {
      records: parsed.requirements.length,
      uniqueIds: new Set(parsed.requirements.map((record) => record.id)).size,
    },
    checks: [
      "all planning Markdown files have a PLAN-REQ index row",
      "requirement IDs are unique",
      "statuses and required evidence fields are valid",
      "declared repository paths do not escape the checkout",
      "source commit, tree, and lockfile hash are recorded",
    ],
  };
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  writeAtomically(outputPath, result);
  console.log(
    `Traceability passed for ${planFiles.length} plan files and ${parsed.requirements.length} requirements (${worktreeClean ? "clean" : "dirty"} source worktree).`,
  );
}

main();
