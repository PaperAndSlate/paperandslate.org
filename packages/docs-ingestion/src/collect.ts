import type { DocsDocument, DocsSource, DocsVersion, Provenance } from "./types";
import { assertSafeDocument } from "./safety";
import { normalizeDocument } from "./normalize";
import { lockFor } from "./locks";
import { readSource } from "./adapters";
export function collectSource(
  source: DocsSource,
  version: DocsVersion,
  cwd = process.cwd(),
): { documents: DocsDocument[]; lock: Provenance } {
  const files = readSource(source, version, cwd);
  const documents = files.map((file) => {
    assertSafeDocument(file.file, file.raw);
    return normalizeDocument(source, version, file.relativePath, file.raw);
  });
  return { documents, lock: lockFor(source, version, files) };
}
