import fs from "node:fs";
import path from "node:path";
import {
  collectSource,
  loadRegistry,
  sourceDocsRoot,
  type DocsDocument,
  type DocsSource,
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

  for (const source of loadRegistry(path.join(cwd, "config", "docs-sources.yml"))) {
    for (const version of source.versions) {
      const label = sourceLabel(source, version.id);
      const root = sourceDocsRoot(source, version, cwd);
      if (!fs.existsSync(root)) {
        if (source.kind === "sibling-local") {
          result.sourceBound = "partial";
          result.missingExternalSources.push(label);
          const externalLock = lock.sources?.find(
            (candidate) => candidate.sourceId === source.id && candidate.ref === version.ref,
          );
          if (
            !externalLock ||
            externalLock.lockType !== "content-hash" ||
            externalLock.sourceMode !== source.kind ||
            !/^[a-f0-9]{64}$/.test(externalLock.contentHash ?? "")
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
      const generatedLock = lock.sources?.find(
        (candidate) => candidate.sourceId === source.id && candidate.ref === version.ref,
      );
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
