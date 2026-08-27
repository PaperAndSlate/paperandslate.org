import type { DocsDocument } from "./types";
export function diffDocuments(before: DocsDocument[], after: DocsDocument[]) {
  const oldIds = new Set(before.map((doc) => doc.id));
  const newIds = new Set(after.map((doc) => doc.id));
  return {
    added: after.filter((doc) => !oldIds.has(doc.id)).map((doc) => doc.id),
    removed: before.filter((doc) => !newIds.has(doc.id)).map((doc) => doc.id),
    changed: after
      .filter(
        (doc) => oldIds.has(doc.id) && before.find((old) => old.id === doc.id)?.hash !== doc.hash,
      )
      .map((doc) => doc.id),
  };
}
