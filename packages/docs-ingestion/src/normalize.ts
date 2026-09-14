import crypto from "node:crypto";
import type { DocsDocument, DocsSource, DocsVersion } from "./types";
import { parseFrontmatter } from "./frontmatter";
import {
  extractMarkdownLinks,
  firstMarkdownLinkDestination,
  headings,
  slugifyHeading,
} from "./markdown";

function normalizeSlashes(value: string): string {
  return value.replaceAll("\\", "/");
}

function stripMarkdownExtension(value: string): string {
  const lower = value.toLowerCase();
  if (lower.endsWith(".mdx")) return value.slice(0, -4);
  if (lower.endsWith(".md")) return value.slice(0, -3);
  return value;
}

function stripTrailingIndex(value: string): string {
  return value.endsWith("/index") ? value.slice(0, -6) : value;
}

function trimPathSlashes(value: string): string {
  let start = 0;
  let end = value.length;
  while (start < end && value[start] === "/") start += 1;
  while (end > start && value[end - 1] === "/") end -= 1;
  return value.slice(start, end);
}

function documentSlug(relativePath: string, explicitSlug: string | undefined): string {
  if (explicitSlug !== undefined) return trimPathSlashes(explicitSlug);
  const normalizedPath = normalizeSlashes(relativePath);
  return trimPathSlashes(stripTrailingIndex(stripMarkdownExtension(normalizedPath)));
}

function isImageAsset(value: string): boolean {
  const lower = value.toLowerCase();
  return (
    lower.endsWith(".png") ||
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".gif") ||
    lower.endsWith(".webp") ||
    lower.endsWith(".avif")
  );
}

function assetDestination(rawTarget: string): string {
  const destination = firstMarkdownLinkDestination(rawTarget);
  const anchor = destination.indexOf("#");
  return anchor < 0 ? destination : destination.slice(0, anchor);
}

export function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}
export function normalizeDocument(
  source: DocsSource,
  version: DocsVersion,
  relativePath: string,
  raw: string,
): DocsDocument {
  const parsed = parseFrontmatter(raw);
  const slug = documentSlug(relativePath, parsed.data.slug);
  const leaf = slug === "index" || !slug ? "" : `/${slug}`;
  const legacyVersion = version.id === "next" ? "/next" : `/${version.id}`;
  const versionPath =
    version.id === "next"
      ? "next"
      : `v/${version.routeVersion ?? (version.id.startsWith("v") ? version.id.slice(1) : version.id)}`;
  const canonicalRoute = `/docs/${source.project}${version.id === "next" ? "" : `/${versionPath}`}${leaf}`;
  const route =
    version.status === "historical"
      ? canonicalRoute
      : `/docs/${source.project}${legacyVersion}${leaf}`;
  const aliases =
    version.status === "historical"
      ? [`/docs/${source.project}${legacyVersion}${leaf}`]
      : [
          ...new Set([route, canonicalRoute, `/docs/${source.project}/${versionPath}${leaf}`]),
        ].filter((candidate) => candidate !== canonicalRoute && candidate !== route);
  const pageHeadings = headings(parsed.body);
  const normalizedPath = normalizeSlashes(relativePath);
  const taxonomy = parsed.data.taxonomy?.length
    ? parsed.data.taxonomy
    : [
        normalizedPath === "index.md"
          ? "getting-started"
          : normalizedPath.split("/")[0] || "reference",
      ];
  const assets = extractMarkdownLinks(parsed.body)
    .map((link) => assetDestination(link.rawTarget))
    .filter(isImageAsset);
  return {
    ...parsed.data,
    id: `${source.id}:${version.id}:${slug || "index"}`,
    route,
    canonicalRoute,
    aliases,
    project: source.project,
    version: version.id,
    sourceId: source.id,
    sourcePath: normalizedPath,
    content: parsed.body,
    headings: pageHeadings,
    hash: sha256(raw),
    sourceHash: sha256(raw),
    status: version.status,
    ref: version.ref,
    sourceMode: source.kind,
    requirementAnchors: [...new Set(pageHeadings.map(slugifyHeading))],
    taxonomy,
    assets,
    title: parsed.data.title,
  };
}
