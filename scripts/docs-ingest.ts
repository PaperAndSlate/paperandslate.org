import path from "node:path";
import {
  collectSource,
  copyAssets,
  generateBundle,
  loadRegistry,
  provenanceFor,
  validateDocuments,
  writeBundle,
} from "../packages/docs-ingestion/src/index";
const documents = [];
const locks = [];
const assets = [];
for (const source of loadRegistry())
  for (const version of source.versions) {
    const result = collectSource(source, version);
    documents.push(...result.documents);
    locks.push(result.lock);
    const root = path.resolve(process.cwd(), source.root, version.docs ?? "");
    assets.push(
      ...copyAssets(
        root,
        path.resolve(process.cwd(), ".generated/assets", source.project, version.id),
      ),
    );
  }
validateDocuments(documents);
const ordered = documents.sort((a, b) => a.id.localeCompare(b.id));
writeBundle(generateBundle(ordered, provenanceFor(ordered, locks), assets));
console.log(`Ingested ${ordered.length} local documentation pages.`);
