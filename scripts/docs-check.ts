import fs from "node:fs";
import {
  collectSource,
  loadRegistry,
  validateDocuments,
} from "../packages/docs-ingestion/src/index";
import { assertCompleteDocsSourceBinding } from "./docs-source-binding";
const docs = [];
for (const source of loadRegistry())
  for (const version of source.versions) docs.push(...collectSource(source, version).documents);
validateDocuments(docs);
assertCompleteDocsSourceBinding();
const generated = JSON.parse(fs.readFileSync(".generated/docs/documents.json", "utf8"));
if (JSON.stringify(generated) !== JSON.stringify(docs.sort((a, b) => a.id.localeCompare(b.id))))
  throw new Error("Generated documents are stale; run pnpm docs:ingest");
for (const file of [
  ".generated/docs/documents.json",
  ".generated/docs/page-tree.json",
  ".generated/docs/project-index.json",
  ".generated/docs/search-records.json",
  ".generated/docs/source-provenance.json",
  ".generated/docs/docs-sources.lock.json",
  ".generated/docs/assets.json",
])
  if (!fs.existsSync(file)) throw new Error(`Missing generated artifact: ${file}`);
const lock = JSON.parse(fs.readFileSync(".generated/docs/docs-sources.lock.json", "utf8")) as {
  sources?: { lockType: string; contentHash: string; files: unknown[]; recordedAt: string }[];
};
if (
  !lock.sources?.every(
    (source) =>
      /^[a-f0-9]{64}$/.test(source.contentHash) &&
      Array.isArray(source.files) &&
      source.recordedAt === "build-time",
  )
)
  throw new Error("Invalid immutable source lock");
console.log(`Validated ${docs.length} local documentation pages.`);
