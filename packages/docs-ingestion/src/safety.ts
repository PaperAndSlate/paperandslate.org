import fs from "node:fs";
import path from "node:path";
import { extractMarkdownLinks, firstMarkdownLinkDestination, headings } from "./markdown";
const MAX_BYTES = 256 * 1024;
const MAX_URL_DECODE_PASSES = 8;

type DecodedUrl = { value: string; complete: boolean };

function decodeUrlRepeated(value: string): DecodedUrl {
  let current = value;
  for (let pass = 0; pass < MAX_URL_DECODE_PASSES; pass += 1) {
    let next: string;
    try {
      next = decodeURIComponent(current);
    } catch {
      return { value: current, complete: false };
    }
    if (next === current) return { value: current, complete: true };
    current = next;
  }
  return { value: current, complete: false };
}

export function assertSafePath(root: string, candidate: string): string {
  const resolvedRoot = fs.realpathSync(root);
  const resolved = fs.realpathSync(candidate);
  if (resolved !== resolvedRoot && !resolved.startsWith(resolvedRoot + path.sep))
    throw new Error(`Path escapes source root: ${candidate}`);
  return resolved;
}
export function safeChildPath(root: string, relative: string): string {
  if (!relative || path.isAbsolute(relative) || relative.includes("\0"))
    throw new Error(`Unsafe include path: ${relative}`);
  return assertSafePath(root, path.resolve(root, relative));
}
function resolvesWithinRoot(file: string, url: string, root: string): boolean {
  const decodedUrl = decodeUrlRepeated(url);
  if (!decodedUrl.complete) return false;
  const decoded = decodedUrl.value;
  const queryIndex = decoded.indexOf("?");
  const anchorIndex = decoded.indexOf("#");
  const suffixIndex =
    queryIndex < 0 ? anchorIndex : anchorIndex < 0 ? queryIndex : Math.min(queryIndex, anchorIndex);
  const pathPart = decoded
    .slice(0, suffixIndex < 0 ? decoded.length : suffixIndex)
    .replaceAll("\\", path.sep);
  const resolved = path.resolve(path.dirname(file), pathPart);
  const resolvedRoot = path.resolve(root);
  const relative = path.relative(resolvedRoot, resolved);
  return (
    relative === "" ||
    (relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative))
  );
}

function containsParentSegment(value: string): boolean {
  const normalized = value.replaceAll("\\", "/");
  let segmentStart = 0;
  for (let index = 0; index <= normalized.length; index += 1) {
    if (index !== normalized.length && normalized[index] !== "/") continue;
    if (normalized.slice(segmentStart, index) === "..") return true;
    segmentStart = index + 1;
  }
  return false;
}

export function assertSafeDocument(
  file: string,
  content: string,
  sourceRoot = path.dirname(file),
): void {
  if (Buffer.byteLength(content, "utf8") > MAX_BYTES)
    throw new Error(`Document exceeds ${MAX_BYTES} bytes: ${file}`);
  if (/^\s*(import|export)\s/m.test(content) || /<\/?[A-Z][\w.-]*(?:\s|>)/.test(content))
    throw new Error(`Unsupported MDX syntax: ${file}`);
  if (/<script\b|\son[a-z]+\s*=|<svg\b|javascript:|data:text\/html|vbscript:/i.test(content))
    throw new Error(`Unsafe markup or URL: ${file}`);
  for (const link of extractMarkdownLinks(content)) {
    const url = firstMarkdownLinkDestination(link.rawTarget);
    const decodedUrl = decodeUrlRepeated(url);
    const unsafeProtocol = /^(?:https?:|\/\/|javascript:|data:|mailto:)/i;
    if (
      !decodedUrl.complete ||
      unsafeProtocol.test(url) ||
      unsafeProtocol.test(decodedUrl.value) ||
      (containsParentSegment(decodedUrl.value) && !resolvesWithinRoot(file, url, sourceRoot))
    )
      throw new Error(`Unsafe URL or traversal: ${url}`);
  }
  const documentHeadings = headings(content);
  if (new Set(documentHeadings).size !== documentHeadings.length)
    throw new Error(`Duplicate heading: ${file}`);
}
export function assertSafeAsset(file: string): void {
  if (!/\.(png|jpe?g|gif|webp|avif)$/i.test(file))
    throw new Error(`Unsupported source asset: ${file}`);
}
