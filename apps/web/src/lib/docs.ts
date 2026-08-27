import documents from "../../../../.generated/docs/documents.json";
import type { DocsDocument } from "../../../../packages/docs-ingestion/src/types";
export const docs = documents as DocsDocument[];
export function getDoc(route: string) {
  return docs.find((doc) =>
    [doc.route, doc.canonicalRoute, ...(doc.aliases ?? [])].includes(route),
  );
}
export function docVersions(doc: DocsDocument) {
  return docs.filter(
    (candidate) => candidate.project === doc.project && candidate.sourcePath === doc.sourcePath,
  );
}
export function docProjects() {
  return [...new Set(docs.map((doc) => doc.project))].sort();
}
export function docTaxonomy() {
  return [...new Set(docs.flatMap((doc) => doc.taxonomy ?? []))].sort();
}
export function docText(doc: DocsDocument) {
  return `# ${doc.title}\n\n${doc.description ?? ""}\n\n${doc.content}`;
}
