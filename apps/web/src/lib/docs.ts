import { publicProjects } from "@paper-and-slate/content";
import documents from "../../../../.generated/docs/documents.json";
import type { DocsDocument } from "../../../../packages/docs-ingestion/src/types";

export type PublicDocsDocument = DocsDocument & {
  /** The immutable project id in the ingestion source registry. */
  sourceProject: string;
  /** The public project slug used by every site surface. */
  publicProject: string;
};

export type DocsProjectRecord = {
  slug: string;
  sourceProject: string;
  title: string;
  root: string;
  document: PublicDocsDocument;
  versions: string[];
};

const generatedDocuments = documents as DocsDocument[];
const sourceToPublicProject = new Map<string, string>([
  ["paper-and-slate", "paper-and-slate"],
  ["standards-file-system", "file-system"],
  ...publicProjects
    .filter((project) => project.docsProject)
    .map((project) => [project.docsProject!, project.slug] as [string, string]),
]);

function publicProjectFor(sourceProject: string) {
  return sourceToPublicProject.get(sourceProject) ?? sourceProject;
}

function publicRouteFor(route: string, publicProject: string) {
  const match = /^\/docs\/[^/]+(\/.*)?$/.exec(route);
  if (!match) return route;
  return `/docs/${publicProject}${match[1] ?? ""}`;
}

/**
 * All page-facing records are normalized here. The generated bundle retains
 * source project ids for provenance, while public routes use the project
 * registry's stable slugs.
 */
export const docs: PublicDocsDocument[] = generatedDocuments.map((doc) => {
  const publicProject = publicProjectFor(doc.project);
  const aliases = new Set(
    [doc.route, doc.canonicalRoute, ...(doc.aliases ?? [])]
      .map((route) => [route, publicRouteFor(route, publicProject)] as const)
      .flat(),
  );
  const canonicalRoute = publicRouteFor(doc.canonicalRoute, publicProject);
  const route = publicRouteFor(doc.route, publicProject);
  aliases.delete(canonicalRoute);
  return {
    ...doc,
    project: publicProject,
    sourceProject: doc.project,
    publicProject,
    route,
    canonicalRoute,
    aliases: [...aliases],
  };
});

const publicIndexStatuses = new Set<PublicDocsDocument["status"]>(["supported", "historical"]);

/** Documents that may appear in public discovery surfaces such as search, sitemap, and AI feeds. */
export function isPublicIndexDocument(doc: PublicDocsDocument) {
  return publicIndexStatuses.has(doc.status);
}

export function docsForSearch() {
  return docs.filter(isPublicIndexDocument);
}

export function docsForSitemap() {
  return docs.filter(isPublicIndexDocument);
}

export function docsForAi() {
  return docs.filter(isPublicIndexDocument);
}

function normalizeRoute(route: string) {
  const value = route.split(/[?#]/, 1)[0].replace(/\\/g, "/");
  const parts = value.split("/").filter(Boolean);
  return parts[0] === "docs" ? `/${parts.join("/")}` : null;
}

const rootDocuments = new Map<string, PublicDocsDocument>();
for (const doc of docs.filter((candidate) => candidate.sourcePath === "index.md")) {
  const current = rootDocuments.get(doc.publicProject);
  if (!current || (current.version !== "next" && doc.version === "next"))
    rootDocuments.set(doc.publicProject, doc);
}

export function docProjectRecords(): DocsProjectRecord[] {
  return [...rootDocuments.entries()]
    .map(([slug, document]) => ({
      slug,
      sourceProject: document.sourceProject,
      title: document.title,
      root: document.canonicalRoute,
      document,
      versions: docVersions(document).map((candidate) => candidate.version),
    }))
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

export type DocsRouteMatch = {
  kind: "project-root" | "document" | "alias";
  requestedRoute: string;
  canonicalRoute: string;
  doc: PublicDocsDocument;
};

/** Resolve roots, canonical routes, generated legacy routes, and public aliases. */
export function resolveDocRoute(route: string): DocsRouteMatch | null {
  const requestedRoute = normalizeRoute(route);
  if (!requestedRoute) return null;

  const root = rootDocuments.get(requestedRoute.slice("/docs/".length));
  if (root)
    return {
      kind: "project-root",
      requestedRoute,
      canonicalRoute: root.canonicalRoute,
      doc: root,
    };

  const doc = docs.find((candidate) =>
    [candidate.route, candidate.canonicalRoute, ...(candidate.aliases ?? [])].includes(
      requestedRoute,
    ),
  );
  if (!doc) return null;
  return {
    kind: requestedRoute === doc.canonicalRoute ? "document" : "alias",
    requestedRoute,
    canonicalRoute: doc.canonicalRoute,
    doc,
  };
}

export function getDoc(route: string) {
  return resolveDocRoute(route)?.doc;
}

export function rawRouteFor(doc: DocsDocument) {
  return `/docs/raw${doc.canonicalRoute.slice("/docs".length)}`;
}

export function docVersions(doc: PublicDocsDocument | DocsDocument) {
  const sourceProject = "sourceProject" in doc ? doc.sourceProject : doc.project;
  return docs.filter(
    (candidate) =>
      candidate.sourceProject === sourceProject && candidate.sourcePath === doc.sourcePath,
  );
}

export function docProjects() {
  return docProjectRecords().map((project) => project.slug);
}

export function docTaxonomy() {
  return [...new Set(docs.flatMap((doc) => doc.taxonomy ?? []))].sort();
}

export function docText(doc: DocsDocument) {
  return `# ${doc.title}\n\n${doc.description ?? ""}\n\n${doc.content}`;
}

export function docRouteManifest() {
  return [
    ...new Set([
      ...docs.flatMap((doc) => [doc.canonicalRoute, ...doc.aliases]),
      ...docProjects().map((slug) => `/docs/${slug}`),
    ]),
  ].sort();
}
