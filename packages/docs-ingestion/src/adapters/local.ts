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
type IncludeMatch = { index: number; end: number; relative: string };
type IncludeScan = { match?: IncludeMatch; nextIndex: number };
export type SourceFile = {
  file: string;
  relativePath: string;
  raw: string;
  source: DocsSource;
  version: DocsVersion;
};
export function normalizeSourceText(content: string): string {
  return content.replace(/\r\n?/g, "\n");
}

function isWhitespaceCharacter(value: string | undefined): boolean {
  return value !== undefined && value.trim() === "";
}

function scanIncludeAt(content: string, start: number): IncludeScan {
  const html = content.startsWith("<!--", start);
  const moustache = content.startsWith("{{", start);
  if (!html && !moustache) return { nextIndex: start + 1 };

  let cursor = start + (html ? 4 : 2);
  while (isWhitespaceCharacter(content[cursor])) cursor += 1;
  if (html) {
    if (!content.startsWith("include:", cursor)) return { nextIndex: cursor };
    cursor += "include:".length;
  } else {
    if (!content.startsWith("include", cursor)) return { nextIndex: cursor };
    cursor += "include".length;
    if (!isWhitespaceCharacter(content[cursor])) return { nextIndex: cursor };
  }
  while (isWhitespaceCharacter(content[cursor])) cursor += 1;

  const tokenStart = cursor;
  while (
    cursor < content.length &&
    !isWhitespaceCharacter(content[cursor]) &&
    content[cursor] !== "}"
  )
    cursor += 1;
  if (tokenStart === cursor) return { nextIndex: Math.max(start + 1, cursor) };
  const relative = content.slice(tokenStart, cursor);

  while (isWhitespaceCharacter(content[cursor])) cursor += 1;
  const closing = html ? "-->" : "}}";
  if (!content.startsWith(closing, cursor)) return { nextIndex: Math.max(start + 1, cursor) };
  cursor += closing.length;
  if (html) while (isWhitespaceCharacter(content[cursor])) cursor += 1;
  return { match: { index: start, end: cursor, relative }, nextIndex: cursor };
}

function findIncludes(content: string): IncludeMatch[] {
  const matches: IncludeMatch[] = [];
  let index = 0;
  while (index < content.length) {
    if (content[index] !== "<" && content[index] !== "{") {
      index += 1;
      continue;
    }
    const scan = scanIncludeAt(content, index);
    if (scan.match) matches.push(scan.match);
    index = Math.max(index + 1, scan.nextIndex);
  }
  return matches;
}

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
  const normalizedContent = normalizeSourceText(content);
  const parts: string[] = [];
  let outputBytes = 0;
  let cursor = 0;
  const append = (part: string) => {
    outputBytes += Buffer.byteLength(part, "utf8");
    if (outputBytes > MAX_DOCUMENT_BYTES)
      throw new Error(`Expanded document exceeds ${MAX_DOCUMENT_BYTES} bytes: ${file}`);
    parts.push(part);
  };
  for (const match of findIncludes(normalizedContent)) {
    const index = match.index;
    append(normalizedContent.slice(cursor, index));
    context.includeCount += 1;
    if (context.includeCount > MAX_INCLUDE_COUNT)
      throw new Error(`Include count exceeds ${MAX_INCLUDE_COUNT}: ${file}`);
    const relative = match.relative;
    const included = safeChildPath(root, relative);
    if (!/\.(md|mdx)$/i.test(included))
      throw new Error(`Includes must target Markdown: ${relative}`);
    append(
      resolveIncludes(
        readUtf8WithinLimit(included, `Included document exceeds ${MAX_DOCUMENT_BYTES} bytes`),
        included,
        root,
        [...stack, file],
        context,
      ),
    );
    cursor = match.end;
  }
  append(normalizedContent.slice(cursor));
  return parts.join("");
}
function readUtf8WithinLimit(file: string, errorPrefix: string): string {
  const handle = fs.openSync(file, "r");
  try {
    const buffer = Buffer.allocUnsafe(MAX_DOCUMENT_BYTES + 1);
    const bytesRead = fs.readSync(handle, buffer, 0, buffer.length, 0);
    if (bytesRead > MAX_DOCUMENT_BYTES) throw new Error(`${errorPrefix}: ${file}`);
    return buffer.subarray(0, bytesRead).toString("utf8");
  } finally {
    fs.closeSync(handle);
  }
}

function readDocument(file: string): string {
  return readUtf8WithinLimit(file, `Document exceeds ${MAX_DOCUMENT_BYTES} bytes`);
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
