import fs from "node:fs";
import { execFileSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import type { DocsSource, DocsVersion } from "../types";
import { readLocalSourceFromRoot, type SourceFile } from "./local";
export function resolvedGitSha(
  source: DocsSource,
  version: DocsVersion,
  cwd = process.cwd(),
): string {
  if (source.kind !== "git" || !source.approved)
    throw new Error(`Git source is not approved: ${source.id}`);
  if (!/^[a-f0-9]{40}$/.test(version.gitSha ?? ""))
    throw new Error(`Git source requires a resolved SHA: ${source.id}/${version.id}`);
  const repositoryRoot = path.resolve(cwd, source.root);
  const actual = execFileSync("git", ["-C", repositoryRoot, "rev-parse", version.gitSha!], {
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
  const sha = resolvedGitSha(source, version, cwd);
  const repositoryRoot = path.resolve(cwd, source.root);
  const docsPrefix = (version.docs ?? "").replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  const listArgs = ["-C", repositoryRoot, "ls-tree", "-r", "-z", sha];
  if (docsPrefix) listArgs.push("--", docsPrefix);
  const tree = execFileSync("git", listArgs, {
    cwd,
    encoding: "utf8",
    maxBuffer: 8 * 1024 * 1024,
  });
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "paperandslate-git-docs-"));
  const temporaryDocsRoot = path.join(temporaryRoot, "docs");
  fs.mkdirSync(temporaryDocsRoot, { recursive: true });
  try {
    for (const entry of tree.split("\0").filter(Boolean)) {
      const separator = entry.indexOf("\t");
      if (separator < 0) throw new Error(`Invalid Git tree entry for ${source.id}/${version.id}`);
      const [mode, type] = entry.slice(0, separator).split(" ");
      const repositoryPath = entry.slice(separator + 1);
      if (type !== "blob" || !["100644", "100755"].includes(mode))
        throw new Error(`Git documentation tree contains a non-regular file: ${repositoryPath}`);
      const relativePath = docsPrefix
        ? repositoryPath.startsWith(`${docsPrefix}/`)
          ? repositoryPath.slice(docsPrefix.length + 1)
          : null
        : repositoryPath;
      if (!relativePath || !/\.(md|mdx)$/i.test(relativePath)) continue;
      if (
        relativePath.includes("\\") ||
        relativePath.split("/").some((part) => !part || part === "." || part === "..")
      )
        throw new Error(`Unsafe Git documentation path: ${repositoryPath}`);
      const destination = path.resolve(temporaryDocsRoot, ...relativePath.split("/"));
      const relativeDestination = path.relative(temporaryDocsRoot, destination);
      if (
        relativeDestination === ".." ||
        relativeDestination.startsWith(`..${path.sep}`) ||
        path.isAbsolute(relativeDestination)
      )
        throw new Error(`Git documentation path escapes its root: ${repositoryPath}`);
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      const content = execFileSync(
        "git",
        ["-C", repositoryRoot, "show", `${sha}:${repositoryPath}`],
        {
          cwd,
          encoding: "utf8",
          maxBuffer: 256 * 1024 + 1,
        },
      );
      fs.writeFileSync(destination, content, "utf8");
    }
    const files = readLocalSourceFromRoot(source, version, temporaryDocsRoot);
    const logicalRoot = docsPrefix
      ? path.join(repositoryRoot, ...docsPrefix.split("/"))
      : repositoryRoot;
    return files.map((file) => ({
      ...file,
      file: path.join(logicalRoot, file.relativePath),
    }));
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
}
