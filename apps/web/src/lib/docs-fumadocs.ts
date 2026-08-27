import { createElement, type ReactNode } from "react";
import type { DocsDocument } from "../../../../packages/docs-ingestion/src/types";
import { mdxComponents } from "../../mdx-components";

// Only reviewed central sources cross this adapter. Imported, fixture, and sibling
// records intentionally remain on the restricted escaped renderer.
const reviewedCentralIds = new Set([
  "central:next:concepts/provenance",
  "central:next:getting-started/welcome",
  "central:next:governance",
]);
export function isReviewedCentral(doc: DocsDocument) {
  return doc.sourceMode === "central" && reviewedCentralIds.has(doc.id);
}
export async function renderCentralMdx(doc: DocsDocument): Promise<ReactNode> {
  if (!isReviewedCentral(doc)) return null;
  const { docs: fumadocsCollection } = await import("../../.source/server");
  const entry = fumadocsCollection.docs.find((candidate) => candidate.info.path === doc.sourcePath);
  if (!entry) throw new Error(`Missing reviewed Fumadocs document: ${doc.sourcePath}`);
  const Body = entry.body;
  return createElement(Body, { components: mdxComponents });
}
