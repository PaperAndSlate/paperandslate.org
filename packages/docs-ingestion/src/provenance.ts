import type { DocsDocument, Provenance } from "./types";
export function provenanceFor(documents: DocsDocument[], locks: Provenance[]): Provenance[] {
  return locks
    .map((lock) => ({ ...lock, path: lock.path.replace(/\\/g, "/") }))
    .sort((a, b) => a.deterministicId.localeCompare(b.deterministicId));
}
