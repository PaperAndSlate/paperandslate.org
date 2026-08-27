import { execFileSync } from "node:child_process";
import type { DocsSource, DocsVersion } from "../types";
import { readLocalSource, type SourceFile } from "./local";
export function resolvedGitSha(
  source: DocsSource,
  version: DocsVersion,
  cwd = process.cwd(),
): string {
  if (source.kind !== "git" || !source.approved)
    throw new Error(`Git source is not approved: ${source.id}`);
  if (!/^[a-f0-9]{40}$/.test(version.gitSha ?? ""))
    throw new Error(`Git source requires a resolved SHA: ${source.id}/${version.id}`);
  const actual = execFileSync("git", ["-C", source.root, "rev-parse", version.gitSha!], {
    cwd,
    encoding: "utf8",
  }).trim();
  if (actual !== version.gitSha)
    throw new Error(
      `Git SHA mismatch for ${source.id}/${version.id}: expected ${version.gitSha}, got ${actual}`,
    );
  return actual;
}
export function readGitSource(
  source: DocsSource,
  version: DocsVersion,
  cwd = process.cwd(),
): SourceFile[] {
  resolvedGitSha(source, version, cwd);
  return readLocalSource(source, version, cwd);
}
