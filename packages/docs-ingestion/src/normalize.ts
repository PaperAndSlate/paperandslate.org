import crypto from "node:crypto";
import type { DocsDocument, DocsSource, DocsVersion } from "./types";
import { parseFrontmatter } from "./frontmatter";
import { headings, slugifyHeading } from "./markdown";
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
  const slug = (
    parsed.data.slug ??
    relativePath
      .replace(/\.(md|mdx)$/i, "")
      .replace(/\\/g, "/")
      .replace(/\/index$/, "")
  ).replace(/^\/+|\/+$/g, "");
  const leaf = slug === "index" || !slug ? "" : `/${slug}`;
  const legacyVersion = version.id === "next" ? "/next" : `/${version.id}`;
  const versionPath =
    version.id === "next" ? "next" : `v/${version.routeVersion ?? version.id.replace(/^v/, "")}`;
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
  const normalizedPath = relativePath.replace(/\\/g, "/");
  const taxonomy = parsed.data.taxonomy?.length
    ? parsed.data.taxonomy
    : [
        normalizedPath === "index.md"
          ? "getting-started"
          : normalizedPath.split("/")[0] || "reference",
      ];
  const assets = [...parsed.body.matchAll(/!?\[[^\]]*\]\(([^)#]+)\)/g)]
    .map((match) => match[1])
    .filter((asset) => /\.(png|jpe?g|gif|webp|avif)$/i.test(asset));
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
