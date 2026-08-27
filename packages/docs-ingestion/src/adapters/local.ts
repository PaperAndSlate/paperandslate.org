import fs from "node:fs";
import path from "node:path";
import type { DocsSource, DocsVersion } from "../types";
import { assertSafePath, safeChildPath } from "../safety";
import { discoverFiles } from "../validate";
import { sourceDocsRoot } from "../registry";
export type SourceFile = {
  file: string;
  relativePath: string;
  raw: string;
  source: DocsSource;
  version: DocsVersion;
};
export function resolveIncludes(
  content: string,
  file: string,
  root: string,
  stack: string[] = [],
): string {
  if (stack.includes(file)) throw new Error(`Include cycle: ${[...stack, file].join(" -> ")}`);
  return content.replace(
    /(?:<!--\s*include:\s*|\{\{\s*include\s+)([^\s}]+)(?:\s*-->\s*|\s*\}\})/g,
    (_match, relative: string) => {
      const included = safeChildPath(root, relative);
      if (!/\.(md|mdx)$/i.test(included))
        throw new Error(`Includes must target Markdown: ${relative}`);
      return resolveIncludes(fs.readFileSync(included, "utf8"), included, root, [...stack, file]);
    },
  );
}
export function readLocalSource(
  source: DocsSource,
  version: DocsVersion,
  cwd = process.cwd(),
): SourceFile[] {
  const root = sourceDocsRoot(source, version, cwd);
  return discoverFiles(root).map((file) => {
    const safe = assertSafePath(root, file);
    return {
      file: safe,
      relativePath: path.relative(root, safe).replace(/\\/g, "/"),
      raw: resolveIncludes(fs.readFileSync(safe, "utf8"), safe, root),
      source,
      version,
    };
  });
}
