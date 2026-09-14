import fs from "node:fs";
import path from "node:path";
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
  const pathPart = decoded.split(/[?#]/, 1)[0].replace(/\\/g, path.sep);
  const resolved = path.resolve(path.dirname(file), pathPart);
  const resolvedRoot = path.resolve(root);
  const relative = path.relative(resolvedRoot, resolved);
  return (
    relative === "" ||
    (relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative))
  );
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
  for (const match of content.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)) {
    const url = match[1].trim().split(/\s+/)[0];
    const decodedUrl = decodeUrlRepeated(url);
    const unsafeProtocol = /^(?:https?:|\/\/|javascript:|data:|mailto:)/i;
    if (
      !decodedUrl.complete ||
      unsafeProtocol.test(url) ||
      unsafeProtocol.test(decodedUrl.value) ||
      (/(^|[\\/])\.\.([\\/]|$)/.test(decodedUrl.value) &&
        !resolvesWithinRoot(file, url, sourceRoot))
    )
      throw new Error(`Unsafe URL or traversal: ${url}`);
  }
  const headings = [...content.matchAll(/^#{1,6}\s+(.+)$/gm)].map((match) =>
    match[1].replace(/\s+#$/, "").trim(),
  );
  if (new Set(headings).size !== headings.length) throw new Error(`Duplicate heading: ${file}`);
}
export function assertSafeAsset(file: string): void {
  if (!/\.(png|jpe?g|gif|webp|avif)$/i.test(file))
    throw new Error(`Unsupported source asset: ${file}`);
}
