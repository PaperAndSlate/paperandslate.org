import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { validateDocuments, type DocsDocument } from "../packages/docs-ingestion/src/index";

const root = process.cwd();
const generatedRoot = path.join(root, ".generated", "docs");
const evidencePath = path.join(root, ".generated", "launch", "docs-bundle-check.json");
const required = [
  "documents.json",
  "page-tree.json",
  "project-index.json",
  "search-records.json",
  "redirects.json",
  "source-provenance.json",
  "docs-sources.lock.json",
  "assets.json",
];

function readJson<T>(name: string): T {
  const file = path.join(generatedRoot, name);
  if (!fs.existsSync(file)) throw new Error(`Missing generated documentation artifact: ${name}`);
  return JSON.parse(fs.readFileSync(file, "utf8")) as T;
}

function writeEvidence(status: "passed" | "failed", error?: string) {
  fs.mkdirSync(path.dirname(evidencePath), { recursive: true });
  fs.writeFileSync(
    evidencePath,
    `${JSON.stringify(
      {
        schemaVersion: 1,
        status,
        generatedAt: new Date().toISOString(),
        source: "committed-generated-bundle",
        artifactRoot: path.relative(root, generatedRoot).replaceAll(path.sep, "/"),
        error: error ?? null,
      },
      null,
      2,
    )}\n`,
  );
}

function main() {
  try {
    for (const file of required) readJson<unknown>(file);
    const documents = readJson<DocsDocument[]>("documents.json");
    if (!Array.isArray(documents) || documents.length === 0)
      throw new Error("Generated documentation bundle contains no documents");
    validateDocuments(documents);
    const ids = new Set<string>();
    const canonicalRoutes = new Set<string>();
    for (const document of documents) {
      if (ids.has(document.id)) throw new Error(`Duplicate generated document ID: ${document.id}`);
      if (canonicalRoutes.has(document.canonicalRoute))
        throw new Error(`Duplicate generated canonical route: ${document.canonicalRoute}`);
      ids.add(document.id);
      canonicalRoutes.add(document.canonicalRoute);
      if (!document.hash || !/^[a-f0-9]{64}$/.test(document.hash))
        throw new Error(`Document hash is not a SHA-256 value: ${document.id}`);
    }
    const searchRecords = readJson<Array<{ id?: string }>>("search-records.json");
    if (searchRecords.length !== documents.length)
      throw new Error("Generated documentation/search record counts differ");
    if (searchRecords.some((record) => !record.id || !ids.has(record.id)))
      throw new Error("Generated documentation search records reference an unknown document");
    const lock = readJson<{
      schema?: number;
      algorithm?: string;
      generatedAt?: string;
      sources?: Array<{
        sourceId?: string;
        contentHash?: string;
        files?: Array<{ path?: string; contentHash?: string }>;
        recordedAt?: string;
      }>;
    }>("docs-sources.lock.json");
    if (
      lock.schema !== 4 ||
      lock.algorithm !== "sha256" ||
      lock.generatedAt !== "build-time" ||
      !lock.sources?.length
    )
      throw new Error("Generated documentation source lock is incomplete");
    for (const source of lock.sources) {
      if (
        !source.sourceId ||
        !source.contentHash ||
        !/^[a-f0-9]{64}$/.test(source.contentHash) ||
        source.recordedAt !== "build-time" ||
        !source.files?.every(
          (file) =>
            Boolean(file.path) &&
            typeof file.contentHash === "string" &&
            /^[a-f0-9]{64}$/.test(file.contentHash),
        )
      )
        throw new Error(
          `Generated documentation source lock is invalid: ${source.sourceId ?? "unknown"}`,
        );
    }
    const bundleHash = crypto
      .createHash("sha256")
      .update(JSON.stringify({ documents, searchRecords, lock }))
      .digest("hex");
    writeEvidence("passed");
    console.log(
      `Validated committed documentation bundle: ${documents.length} documents (${bundleHash.slice(0, 16)}).`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    writeEvidence("failed", message);
    throw error;
  }
}

main();
