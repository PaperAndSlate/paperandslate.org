import fs from "node:fs";
import path from "node:path";
import type { DocsBundle, DocsDocument, Provenance } from "./types";
export function generateBundle(
  documents: DocsDocument[],
  provenance: Provenance[],
  assets: Record<string, unknown>[] = [],
): DocsBundle {
  const projectIndex = [...new Set(documents.map((d) => d.project))].sort().map((project) => ({
    project,
    documents: documents.filter((d) => d.project === project).map((d) => d.id),
    versions: [...new Set(documents.filter((d) => d.project === project).map((d) => d.version))],
  }));
  const pageTree = {
    taxonomy: [...new Set(documents.flatMap((d) => d.taxonomy))].sort(),
    projects: projectIndex,
  };
  const searchRecords = documents.map((d) => ({
    id: d.id,
    route: d.canonicalRoute,
    legacyRoute: d.route,
    title: d.title,
    description: d.description ?? "",
    sourceId: d.sourceId,
    version: d.version,
    taxonomy: d.taxonomy,
    anchors: d.requirementAnchors,
    text: d.content.replace(/[#*_`]/g, ""),
  }));
  const lock = {
    schema: 4,
    algorithm: "sha256",
    generatedAt: "build-time",
    sources: provenance.map((p) => ({
      sourceId: p.sourceId,
      path: p.path,
      ref: p.ref,
      sourceMode: p.sourceMode,
      lockType: p.lockType,
      gitSha: p.resolvedSha ?? null,
      contentHash: p.contentHash,
      files: p.files,
      deterministicId: p.deterministicId,
      editable: p.editable,
      recordedAt: p.recordedAt,
    })),
  };
  return {
    documents,
    provenance,
    pageTree,
    projectIndex,
    searchRecords,
    redirects: Object.fromEntries(
      documents.flatMap((d) => d.aliases.map((alias) => [alias, d.canonicalRoute])),
    ),
    lock,
    assets,
  };
}
export function writeBundle(bundle: DocsBundle, outDir = ".generated/docs"): void {
  fs.mkdirSync(outDir, { recursive: true });
  const files: Record<string, unknown> = {
    documents: bundle.documents,
    "page-tree": bundle.pageTree,
    "project-index": bundle.projectIndex,
    "search-records": bundle.searchRecords,
    redirects: bundle.redirects,
    "source-provenance": bundle.provenance,
    "docs-sources.lock": bundle.lock,
    assets: bundle.assets,
  };
  for (const [name, value] of Object.entries(files))
    fs.writeFileSync(
      path.join(outDir, `${name}.json`),
      `${JSON.stringify(value, null, 2)}\n`,
      "utf8",
    );
}
