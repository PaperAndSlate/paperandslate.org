import fs from "node:fs";
import path from "node:path";
import type { DocsSource, DocsVersion } from "../types";
import { assertSafePath, safeChildPath } from "../safety";
import { discoverFiles } from "../validate";
import { sourceDocsRoot } from "../registry";
const MAX_DOCUMENT_BYTES = 256 * 1024;
const MAX_INCLUDE_DEPTH = 32;
const MAX_INCLUDE_COUNT = 128;
const MAX_INCLUDE_SOURCE_BYTES = 1024 * 1024;
type IncludeContext = { includeCount: number; sourceBytes: number };
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
  context: IncludeContext = { includeCount: 0, sourceBytes: 0 },
): string {
  if (stack.length > MAX_INCLUDE_DEPTH)
    throw new Error(`Include depth exceeds ${MAX_INCLUDE_DEPTH}: ${file}`);
  if (stack.includes(file)) throw new Error(`Include cycle: ${[...stack, file].join(" -> ")}`);
  context.sourceBytes += Buffer.byteLength(content, "utf8");
  if (context.sourceBytes > MAX_INCLUDE_SOURCE_BYTES)
    throw new Error(`Include source budget exceeds ${MAX_INCLUDE_SOURCE_BYTES} bytes: ${file}`);
  const parts: string[] = [];
  let outputBytes = 0;
  let cursor = 0;
  const append = (part: string) => {
    outputBytes += Buffer.byteLength(part, "utf8");
    if (outputBytes > MAX_DOCUMENT_BYTES)
      throw new Error(`Expanded document exceeds ${MAX_DOCUMENT_BYTES} bytes: ${file}`);
    parts.push(part);
  };
  const pattern = /(?:<!--\s*include:\s*|\{\{\s*include\s+)([^\s}]+)(?:\s*-->\s*|\s*\}\})/g;
  for (const match of content.matchAll(pattern)) {
    const index = match.index ?? 0;
    append(content.slice(cursor, index));
    context.includeCount += 1;
    if (context.includeCount > MAX_INCLUDE_COUNT)
      throw new Error(`Include count exceeds ${MAX_INCLUDE_COUNT}: ${file}`);
    const relative = match[1];
    const included = safeChildPath(root, relative);
    if (!/\.(md|mdx)$/i.test(included))
      throw new Error(`Includes must target Markdown: ${relative}`);
    const size = fs.statSync(included).size;
    if (size > MAX_DOCUMENT_BYTES)
      throw new Error(`Included document exceeds ${MAX_DOCUMENT_BYTES} bytes: ${included}`);
    append(
      resolveIncludes(fs.readFileSync(included, "utf8"), included, root, [...stack, file], context),
    );
    cursor = index + match[0].length;
  }
  append(content.slice(cursor));
  return parts.join("");
}
function readDocument(file: string): string {
  if (fs.statSync(file).size > MAX_DOCUMENT_BYTES)
    throw new Error(`Document exceeds ${MAX_DOCUMENT_BYTES} bytes: ${file}`);
  return fs.readFileSync(file, "utf8");
}
export function readLocalSourceFromRoot(
  source: DocsSource,
  version: DocsVersion,
  root: string,
): SourceFile[] {
  return discoverFiles(root).map((file) => {
    const safe = assertSafePath(root, file);
    return {
      file: safe,
      relativePath: path.relative(root, safe).replace(/\\/g, "/"),
      raw: resolveIncludes(readDocument(safe), safe, root),
      source,
      version,
    };
  });
}
export function readLocalSource(
  source: DocsSource,
  version: DocsVersion,
  cwd = process.cwd(),
): SourceFile[] {
  const root = sourceDocsRoot(source, version, cwd);
  return readLocalSourceFromRoot(source, version, root);
}
