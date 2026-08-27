import type { DocsSource, DocsVersion } from "../types";
import { readLocalSource, type SourceFile } from "./local";
import { readFixtureSource } from "./fixture";
import { readGitSource } from "./git";
export * from "./local";
export * from "./fixture";
export * from "./git";
export function readSource(
  source: DocsSource,
  version: DocsVersion,
  cwd = process.cwd(),
): SourceFile[] {
  if (source.kind === "fixture") return readFixtureSource(source, version, cwd);
  if (source.kind === "git") return readGitSource(source, version, cwd);
  return readLocalSource(source, version, cwd);
}
