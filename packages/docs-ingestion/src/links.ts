import path from "node:path";
import type { DocsDocument } from "./types";
import {
  extractMarkdownLinks,
  firstMarkdownLinkDestination,
  splitMarkdownLinkTarget,
} from "./markdown";

const MAX_URL_DECODE_PASSES = 8;

function decodeUrlRepeated(value: string): { value: string; complete: boolean } {
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

function sourcePathCandidates(sourcePath: string, destination: string): string[] {
  const decodedUrl = decodeUrlRepeated(destination);
  if (!decodedUrl.complete) return [];
  const decoded = decodedUrl.value;
  const normalized = path.posix.normalize(
    path.posix.join(path.posix.dirname(sourcePath), decoded.replaceAll("\\", "/")),
  );
  if (normalized === "." || normalized === ".." || normalized.startsWith("../")) return [];
  const candidates = [normalized];
  const normalizedLower = normalized.toLowerCase();
  if (!normalizedLower.endsWith(".md") && !normalizedLower.endsWith(".mdx")) {
    candidates.push(`${normalized}.md`, `${normalized}.mdx`);
  }
  if (normalizedLower.endsWith("/index.md") || normalizedLower.endsWith("/index.mdx")) {
    candidates.push(normalized.slice(0, normalized.lastIndexOf("/index.")));
  } else {
    const withoutTrailingSlash = normalized.endsWith("/") ? normalized.slice(0, -1) : normalized;
    candidates.push(`${withoutTrailingSlash}/index.md`, `${withoutTrailingSlash}/index.mdx`);
  }
  return [...new Set(candidates)];
}

function isAsciiAlpha(value: string | undefined): boolean {
  if (value === undefined) return false;
  const code = value.toLowerCase().charCodeAt(0);
  return code >= 97 && code <= 122;
}

function isSchemeCharacter(value: string | undefined): boolean {
  if (value === undefined) return false;
  const lower = value.toLowerCase();
  if (isAsciiAlpha(lower)) return true;
  return value === "+" || value === "." || value === "-" || (value >= "0" && value <= "9");
}

function hasUrlScheme(destination: string): boolean {
  if (destination.startsWith("//")) return true;
  const colon = destination.indexOf(":");
  if (colon <= 0) return false;
  if (!isAsciiAlpha(destination[0])) return false;
  for (let index = 1; index < colon; index += 1)
    if (!isSchemeCharacter(destination[index])) return false;
  return true;
}

function isRelativeDestination(destination: string): boolean {
  return (
    destination !== "" &&
    !destination.startsWith("/") &&
    !destination.startsWith("#") &&
    !hasUrlScheme(destination)
  );
}

function sameSourceDocument(
  current: DocsDocument,
  destination: string,
  documents: DocsDocument[],
): DocsDocument | undefined {
  const candidates = new Set(sourcePathCandidates(current.sourcePath, destination));
  if (!candidates.size) return undefined;
  return documents.find(
    (document) =>
      document.sourceId === current.sourceId &&
      document.version === current.version &&
      candidates.has(document.sourcePath),
  );
}

function inertLabel(label: string): string {
  return label;
}

export function rewriteDocLinks(content: string, documents: DocsDocument[]): string {
  const links = extractMarkdownLinks(content);
  const chunks: string[] = [];
  let cursor = 0;
  for (const link of links) {
    const trimmedTarget = link.rawTarget.trim();
    const token = firstMarkdownLinkDestination(trimmedTarget);
    const title = trimmedTarget.slice(token.length);
    const anchorIndex = token.indexOf("#");
    if (title && anchorIndex < 0) continue;
    const route = anchorIndex < 0 ? token : token.slice(0, anchorIndex);
    if (!route.startsWith("/docs/")) continue;
    const target = documents.find((doc) =>
      [doc.route, doc.canonicalRoute, ...doc.aliases].includes(route),
    );
    if (!target) continue;
    const suffix = anchorIndex < 0 ? "" : token.slice(anchorIndex);
    chunks.push(content.slice(cursor, link.start));
    chunks.push(
      `${link.image ? "!" : ""}[${link.label}](${target.canonicalRoute}${suffix}${title})`,
    );
    cursor = link.end;
  }
  if (!chunks.length) return content;
  chunks.push(content.slice(cursor));
  return chunks.join("");
}

/**
 * Normalize links in one source/version after all of its documents are known.
 * Same-source Markdown links become canonical routes. Source-adjacent links
 * that are not ingested remain visible labels without a runtime URL.
 */
export function rewriteDocumentLinks(documents: DocsDocument[]): DocsDocument[] {
  return documents.map((current) => ({
    ...current,
    content: rewriteDocumentLinksInContent(current, documents),
  }));
}

function rewriteDocumentLinksInContent(current: DocsDocument, documents: DocsDocument[]): string {
  const chunks: string[] = [];
  let cursor = 0;
  for (const link of extractMarkdownLinks(current.content)) {
    if (link.rawTarget.includes("\n")) continue;
    const { destination, suffix, title } = splitMarkdownLinkTarget(link.rawTarget);
    if (!isRelativeDestination(destination)) continue;

    const target = sameSourceDocument(current, destination, documents);
    let replacement: string | undefined;
    if (target && !link.image)
      replacement = `[${link.label}](${target.canonicalRoute}${suffix}${title})`;
    else {
      const decodedUrl = decodeUrlRepeated(destination);
      if (!decodedUrl.complete) continue;
      // Images stay source-relative so the asset pipeline can fingerprint them.
      // Every unresolved non-image relative reference is source-adjacent content
      // (document, schema, download, or repository file) and must not become a
      // broken runtime URL or an invented route.
      if (link.image) continue;
      replacement = inertLabel(link.label);
    }

    chunks.push(current.content.slice(cursor, link.start));
    chunks.push(replacement);
    cursor = link.end;
  }
  if (!chunks.length) return current.content;
  chunks.push(current.content.slice(cursor));
  return chunks.join("");
}
