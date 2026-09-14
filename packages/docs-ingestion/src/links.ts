import path from "node:path";
import type { DocsDocument } from "./types";

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

function splitDestination(raw: string): { destination: string; suffix: string; title: string } {
  const trimmed = raw.trim();
  const match = /^(\S+)([\s\S]*)$/.exec(trimmed);
  if (!match) return { destination: "", suffix: "", title: "" };
  const destination = match[1];
  const suffixIndex = destination.search(/[?#]/);
  if (suffixIndex < 0) return { destination, suffix: "", title: match[2] };
  return {
    destination: destination.slice(0, suffixIndex),
    suffix: destination.slice(suffixIndex),
    title: match[2],
  };
}

function sourcePathCandidates(sourcePath: string, destination: string): string[] {
  const decodedUrl = decodeUrlRepeated(destination);
  if (!decodedUrl.complete) return [];
  const decoded = decodedUrl.value;
  const normalized = path.posix.normalize(
    path.posix.join(path.posix.dirname(sourcePath), decoded.replace(/\\/g, "/")),
  );
  if (normalized === "." || normalized === ".." || normalized.startsWith("../")) return [];
  const candidates = [normalized];
  if (!/\.(?:md|mdx)$/i.test(normalized)) {
    candidates.push(`${normalized}.md`, `${normalized}.mdx`);
  }
  if (/\/index\.(?:md|mdx)$/i.test(normalized))
    candidates.push(normalized.replace(/\/index\.(?:md|mdx)$/i, ""));
  else
    candidates.push(
      `${normalized.replace(/\/$/, "")}/index.md`,
      `${normalized.replace(/\/$/, "")}/index.mdx`,
    );
  return [...new Set(candidates)];
}

function isRelativeDestination(destination: string): boolean {
  return (
    destination !== "" &&
    !destination.startsWith("/") &&
    !destination.startsWith("#") &&
    !/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(destination)
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
  return content.replace(/\]\((\/docs\/[^)#]+)(#[^)]+)?\)/g, (all, route, anchor = "") => {
    const target = documents.find((doc) =>
      [doc.route, doc.canonicalRoute, ...doc.aliases].includes(route),
    );
    return target ? `](${target.canonicalRoute}${anchor})` : all;
  });
}

/**
 * Normalize links in one source/version after all of its documents are known.
 * Same-source Markdown links become canonical routes. Source-adjacent links
 * that are not ingested remain visible labels without a runtime URL.
 */
export function rewriteDocumentLinks(documents: DocsDocument[]): DocsDocument[] {
  return documents.map((current) => ({
    ...current,
    content: current.content.replace(
      /(!?)\[([^\]]*)\]\(([^)\n]+)\)/g,
      (all, image, label, rawTarget) => {
        const { destination, suffix, title } = splitDestination(rawTarget);
        if (!isRelativeDestination(destination)) return all;
        const target = sameSourceDocument(current, destination, documents);
        if (target && !image) return `[${label}](${target.canonicalRoute}${suffix}${title})`;

        const decodedUrl = decodeUrlRepeated(destination);
        if (!decodedUrl.complete) return all;
        // Images stay source-relative so the asset pipeline can fingerprint them.
        // Every unresolved non-image relative reference is source-adjacent content
        // (document, schema, download, or repository file) and must not become a
        // broken runtime URL or an invented route.
        return image ? all : inertLabel(label);
      },
    ),
  }));
}
