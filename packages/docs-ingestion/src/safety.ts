import fs from "node:fs";
import path from "node:path";
const MAX_BYTES = 256 * 1024;
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
export function assertSafeDocument(file: string, content: string): void {
  if (Buffer.byteLength(content, "utf8") > MAX_BYTES)
    throw new Error(`Document exceeds ${MAX_BYTES} bytes: ${file}`);
  if (/^\s*(import|export)\s/m.test(content) || /<\/?[A-Z][\w.-]*(?:\s|>)/.test(content))
    throw new Error(`Unsupported MDX syntax: ${file}`);
  if (/<script\b|\son[a-z]+\s*=|<svg\b|javascript:|data:text\/html|vbscript:/i.test(content))
    throw new Error(`Unsafe markup or URL: ${file}`);
  for (const match of content.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)) {
    const url = match[1].trim().split(/\s+/)[0];
    if (/^(?:https?:|\/\/|javascript:|data:|mailto:)/i.test(url) || /(^|\/)\.\.(\/|$)/.test(url))
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
