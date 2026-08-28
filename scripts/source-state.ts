import { execFileSync } from "node:child_process";

const generatedPath = (file: string) =>
  file === "IMPLEMENTATION_LEDGER.md" || file.replaceAll("\\", "/").startsWith(".generated/");

export function sourceDirtyPaths(status: string) {
  return status
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.slice(3))
    .map((file) => file.replaceAll("\\", "/"))
    .filter((file) => !generatedPath(file));
}

export function sourceWorktreeClean(status: string) {
  return sourceDirtyPaths(status).length === 0;
}

export type SourceWorktreeStatus = {
  available: boolean;
  clean: boolean;
  dirtyPaths: string[];
};

export function classifySourceWorktree(status: string | null): SourceWorktreeStatus {
  const dirtyPaths = status === null ? [] : sourceDirtyPaths(status);
  return {
    available: status !== null,
    clean: status !== null && dirtyPaths.length === 0,
    dirtyPaths,
  };
}

export type SourceState = {
  commit: string | null;
  tree: string | null;
  worktreeClean: boolean;
  dirtyPaths: string[];
};

function git(root: string, args: string[]) {
  try {
    return execFileSync(process.platform === "win32" ? "git.exe" : "git", args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trimEnd();
  } catch {
    return null;
  }
}

export function readSourceState(root: string): SourceState {
  const status = git(root, ["status", "--porcelain", "--untracked-files=all"]);
  const worktree = classifySourceWorktree(status);
  return {
    commit: git(root, ["rev-parse", "HEAD"]),
    tree: git(root, ["rev-parse", "HEAD^{tree}"]),
    worktreeClean: worktree.clean,
    dirtyPaths: worktree.dirtyPaths,
  };
}
