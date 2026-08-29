import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { assertExactSourceRevision } from "./evidence-identity";
import { classifySourceWorktree, normalizeGitStatus } from "./source-state";

type CommandResult = { value: string | null; error: string | null };

export type RepositoryEvidenceStatus = "passed" | "local-only" | "failed";

export function classifyRepositoryEvidence(input: {
  localIdentityPresent: boolean;
  worktreeClean: boolean;
  remoteResolution: "verified" | "unavailable" | "missing";
  remoteCandidateShaPresent: boolean;
}): RepositoryEvidenceStatus {
  if (
    input.localIdentityPresent &&
    input.worktreeClean &&
    input.remoteResolution === "verified" &&
    input.remoteCandidateShaPresent
  )
    return "passed";
  if (input.localIdentityPresent && input.worktreeClean) return "local-only";
  return "failed";
}

const root = process.cwd();
const outputPath = path.join(root, ".generated", "launch", "repository-identity.json");
const gitCommand = process.platform === "win32" ? "git.exe" : "git";
const commandEnv = { ...process.env, GIT_TERMINAL_PROMPT: "0" };

function git(args: string[]): CommandResult {
  try {
    return {
      value: normalizeGitStatus(
        execFileSync(gitCommand, args, {
          cwd: root,
          encoding: "utf8",
          env: commandEnv,
          stdio: ["ignore", "pipe", "pipe"],
        }),
      ),
      error: null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { value: null, error: message.split(/\r?\n/)[0] };
  }
}

function sanitizedRemote(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    url.username = "";
    url.password = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return value.replace(/(https?:\/\/)([^/@]+)@/i, "$1");
  }
}

function parseRefs(value: string | null) {
  return (value ?? "")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const [sha, ref] = line.split(/\s+/, 2);
      return { sha, ref };
    })
    .filter((item) => Boolean(item.sha && item.ref));
}

function main() {
  const head = git(["rev-parse", "HEAD"]);
  const branch = git(["branch", "--show-current"]);
  const remote = git(["remote", "get-url", "origin"]);
  const exactTag = git(["describe", "--tags", "--exact-match"]);
  const status = git(["status", "--porcelain", "--untracked-files=all"]);
  const worktree = classifySourceWorktree(status.value);
  if (process.env.GIT_SHA)
    assertExactSourceRevision({
      currentRevision: head.value,
      candidateRevision: process.env.GIT_SHA,
      context: "Repository evidence",
      kind: "configured",
    });
  const refs = remote.value
    ? git(["ls-remote", "--heads", "--tags", "origin"])
    : { value: null, error: null };
  const remoteRefs = parseRefs(refs.value);
  const worktreeClean = worktree.clean;
  const localIdentityPresent = Boolean(
    head.value && branch.value && remote.value && worktree.available,
  );
  const remoteResolution = remote.value
    ? refs.value !== null
      ? "verified"
      : "unavailable"
    : "missing";
  const remoteCandidateShaPresent = Boolean(
    head.value &&
      remoteResolution === "verified" &&
      remoteRefs.some((ref) => ref.sha === head.value),
  );
  const evidenceStatus = classifyRepositoryEvidence({
    localIdentityPresent,
    worktreeClean,
    remoteResolution,
    remoteCandidateShaPresent,
  });
  const evidence = {
    schemaVersion: 1,
    status: evidenceStatus,
    generatedAt: new Date().toISOString(),
    releaseId: process.env.RELEASE_ID ?? "local-development",
    gitSha: process.env.GIT_SHA ?? head.value ?? "uncommitted",
    repository: {
      provider: "Forgejo via Tower",
      remote: sanitizedRemote(remote.value),
      branch: branch.value,
      localSha: head.value,
      exactTag: exactTag.value,
      worktreeClean,
      worktreeStatusAvailable: worktree.available,
      dirtyPaths: worktree.dirtyPaths,
      remoteResolution,
      remoteCandidateShaPresent,
      remoteRefs,
    },
    errors: {
      head: head.error,
      branch: branch.error,
      remote: remote.error,
      exactTag: exactTag.error,
      status: status.error,
      remoteRefs: refs.error,
    },
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(evidence, null, 2)}\n`);
  if (evidence.status === "failed") {
    throw new Error("Could not establish local Git repository identity.");
  }
  console.log(
    `Recorded repository identity for ${evidence.repository.remote} at ${evidence.repository.branch}; remote refs ${remoteResolution}, candidate ${remoteCandidateShaPresent ? "present" : "missing"}; status ${evidence.status}.`,
  );
}

if (process.argv[1]?.replaceAll("\\", "/").endsWith("/repository-evidence.ts")) main();
