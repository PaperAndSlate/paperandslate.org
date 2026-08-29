import fs from "node:fs";
import path from "node:path";
import {
  collectSource,
  loadRegistry,
  sourceDocsRoot,
  type DocsDocument,
  type DocsSource,
  type DocsVersion,
} from "../packages/docs-ingestion/src/index";

type GeneratedLock = {
  sourceId?: string;
  ref?: string;
  sourceMode?: string;
  lockType?: string;
  contentHash?: string;
  deterministicId?: string;
  files?: Array<{ path?: string; contentHash?: string }>;
};

export type DocsSourceBindingResult = {
  sourceBound: "complete" | "partial";
  checkedSources: string[];
  missingExternalSources: string[];
  mismatches: string[];
};

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, child]) => `${JSON.stringify(key)}:${canonical(child)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, "utf8")) as T;
}

function sourceLabel(source: DocsSource, versionId: string) {
  return `${source.id}/${versionId}`;
}

function lockKey(sourceId: string | undefined, ref: string | undefined) {
  return sourceId && ref ? `${sourceId}\0${ref}` : null;
}

function documentSlug(document: DocsDocument) {
  const explicit = typeof document.slug === "string" ? document.slug : undefined;
  return (
    (explicit ?? document.sourcePath.replace(/\.(md|mdx)$/i, "").replace(/\/index$/, ""))
      .replace(/\\/g, "/")
      .replace(/^\/+|\/+$/g, "") || "index"
  );
}

function expectedDocumentId(source: DocsSource, version: DocsVersion, document: DocsDocument) {
  return `${source.id}:${version.id}:${documentSlug(document)}`;
}

function validLockFilePath(value: string | undefined) {
  if (!value || path.isAbsolute(value)) return false;
  return !value.split(/[\\/]/).some((part) => !part || part === "." || part === "..");
}

function bindGeneratedDocuments(
  documents: DocsDocument[],
  source: DocsSource,
  version: DocsVersion,
  generatedLock: GeneratedLock | undefined,
  result: DocsSourceBindingResult,
) {
  const label = sourceLabel(source, version.id);
  const files = new Map(
    (generatedLock?.files ?? []).map((file) => [file.path, file.contentHash] as const),
  );
  const matching = documents.filter(
    (document) => document.sourceId === source.id && document.ref === version.ref,
  );
  for (const document of matching) {
    if (
      document.version !== version.id ||
      document.project !== source.project ||
      document.sourceMode !== source.kind
    )
      result.mismatches.push(`${label}: generated document metadata is not bound to its source`);
    if (document.id !== expectedDocumentId(source, version, document))
      result.mismatches.push(
        `${label}: generated document ID is not deterministic (${document.id})`,
      );
    const expectedHash = files.get(document.sourcePath);
    if (!expectedHash) {
      result.mismatches.push(
        `${label}: generated document is not present in the source lock (${document.sourcePath})`,
      );
    } else if (document.hash !== expectedHash || document.sourceHash !== expectedHash) {
      result.mismatches.push(
        `${label}: generated document hash does not match the source lock (${document.id})`,
      );
    }
  }
  for (const file of generatedLock?.files ?? []) {
    if (!validLockFilePath(file.path) || !/^[a-f0-9]{64}$/.test(file.contentHash ?? "")) {
      result.mismatches.push(`${label}: source lock contains an invalid file entry`);
      continue;
    }
    if (!matching.some((document) => document.sourcePath === file.path))
      result.mismatches.push(`${label}: source lock file has no generated document (${file.path})`);
  }
}

export function checkDocsSourceBinding(cwd = process.cwd()): DocsSourceBindingResult {
  const generatedRoot = path.join(cwd, ".generated", "docs");
  const documents = readJson<DocsDocument[]>(path.join(generatedRoot, "documents.json"));
  const lock = readJson<{ sources?: GeneratedLock[] }>(
    path.join(generatedRoot, "docs-sources.lock.json"),
  );
  const byId = new Map(documents.map((document) => [document.id, document]));
  const result: DocsSourceBindingResult = {
    sourceBound: "complete",
    checkedSources: [],
    missingExternalSources: [],
    mismatches: [],
  };

  const configuredSources = loadRegistry(path.join(cwd, "config", "docs-sources.yml"));
  const configuredKeys = new Set<string>();
  const generatedLocks = new Map<string, GeneratedLock>();
  for (const candidate of lock.sources ?? []) {
    const key = lockKey(candidate.sourceId, candidate.ref);
    if (key) generatedLocks.set(key, candidate);
  }

  for (const source of configuredSources) {
    for (const version of source.versions) {
      const label = sourceLabel(source, version.id);
      const key = lockKey(source.id, version.ref);
      if (!key) {
        result.mismatches.push(`${label}: source/ref identity is incomplete`);
        continue;
      }
      configuredKeys.add(key);
      const root = sourceDocsRoot(source, version, cwd);
      const generatedLock = generatedLocks.get(key);
      bindGeneratedDocuments(documents, source, version, generatedLock, result);
      if (!fs.existsSync(root)) {
        if (source.kind === "sibling-local") {
          result.sourceBound = "partial";
          result.missingExternalSources.push(label);
          const externalLock = generatedLock;
          if (
            !externalLock ||
            externalLock.lockType !== "content-hash" ||
            externalLock.sourceMode !== source.kind ||
            !/^[a-f0-9]{64}$/.test(externalLock.contentHash ?? "") ||
            !externalLock.files?.length
          )
            result.mismatches.push(`${label}: missing or invalid external source lock`);
          continue;
        }
        result.mismatches.push(`${label}: configured source root is missing (${root})`);
        continue;
      }

      result.checkedSources.push(label);
      let collected: ReturnType<typeof collectSource>;
      try {
        collected = collectSource(source, version, cwd);
      } catch (error) {
        result.mismatches.push(
          `${label}: source collection failed: ${error instanceof Error ? error.message : String(error)}`,
        );
        continue;
      }
      for (const document of collected.documents) {
        const generated = byId.get(document.id);
        if (!generated) {
          result.mismatches.push(`${label}: generated document is missing (${document.id})`);
        } else if (canonical(generated) !== canonical(document)) {
          result.mismatches.push(`${label}: generated document is stale (${document.id})`);
        }
      }
      if (
        !generatedLock ||
        canonical({
          sourceId: generatedLock.sourceId,
          ref: generatedLock.ref,
          sourceMode: generatedLock.sourceMode,
          lockType: generatedLock.lockType,
          contentHash: generatedLock.contentHash,
          deterministicId: generatedLock.deterministicId,
          files: generatedLock.files,
        }) !==
          canonical({
            sourceId: collected.lock.sourceId,
            ref: collected.lock.ref,
            sourceMode: collected.lock.sourceMode,
            lockType: collected.lock.lockType,
            contentHash: collected.lock.contentHash,
            deterministicId: collected.lock.deterministicId,
            files: collected.lock.files,
          })
      )
        result.mismatches.push(`${label}: generated source lock is stale`);
    }
  }
  for (const candidate of lock.sources ?? []) {
    const key = lockKey(candidate.sourceId, candidate.ref);
    if (key && !configuredKeys.has(key))
      result.mismatches.push(
        `unregistered generated source lock: ${candidate.sourceId}/${candidate.ref}`,
      );
  }
  for (const document of documents) {
    if (!lockKey(document.sourceId, document.ref))
      result.mismatches.push(`generated document has no source/ref binding: ${document.id}`);
  }
  return result;
}

export function assertCompleteDocsSourceBinding(cwd = process.cwd()) {
  const result = checkDocsSourceBinding(cwd);
  if (result.sourceBound !== "complete" || result.mismatches.length) {
    throw new Error(
      `Documentation source binding is ${result.sourceBound}: ${[
        ...result.mismatches,
        ...result.missingExternalSources.map((source) => `${source}: source is unavailable`),
      ].join("; ")}`,
    );
  }
  return result;
}
