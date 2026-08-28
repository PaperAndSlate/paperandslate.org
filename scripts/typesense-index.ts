import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  createFallbackSearchProvider,
  createStaticSearchProvider,
  type SearchProvider,
  type SearchRecord,
} from "../packages/search/src";
import { readSourceState } from "./source-state";

const root = process.cwd();
const reportPath = path.join(root, ".generated", "search", "typesense-index.json");
const defaultAlias = "search_records";

export type TypesenseIndexReport = {
  schemaVersion: 1;
  status: "passed";
  collection: string;
  alias: string;
  indexId: string;
  buildId: string;
  documentCount: number;
  indexedAt: string;
  sourceSha: string;
  keySeparation: {
    writeIndexStatus: "passed";
    searchStatus: "passed";
    searchWriteStatus: "passed";
  };
  checks: {
    projectExactMatch: "passed";
    documentationMatch: "passed";
    newsMatch: "passed";
    facets: "passed";
    ranking: "passed";
    alias: "passed";
    previewExclusion: "passed";
    staticFallback: "passed";
  };
};

type TypesenseResponse = { status: number; body: string };

function endpointUrl(endpoint: string, pathname: string) {
  return `${endpoint.replace(/\/$/, "")}${pathname}`;
}

async function request(
  endpoint: string,
  apiKey: string,
  pathname: string,
  init: RequestInit = {},
): Promise<TypesenseResponse> {
  const response = await fetch(endpointUrl(endpoint, pathname), {
    ...init,
    headers: {
      Accept: "application/json",
      "X-TYPESENSE-API-KEY": apiKey,
      ...(init.headers ?? {}),
    },
    signal: AbortSignal.timeout(15_000),
  });
  return { status: response.status, body: await response.text() };
}

function jsonBody(body: string, context: string) {
  try {
    return JSON.parse(body) as Record<string, unknown>;
  } catch {
    throw new Error(`Typesense returned invalid JSON for ${context}`);
  }
}

function collectionSchema(name: string) {
  return {
    name,
    fields: [
      { name: "id", type: "string" },
      { name: "title", type: "string" },
      { name: "summary", type: "string" },
      { name: "text", type: "string", optional: true },
      { name: "route", type: "string" },
      { name: "type", type: "string", facet: true },
      { name: "source", type: "string", facet: true },
      { name: "visibility", type: "string", facet: true },
      { name: "date", type: "string", optional: true },
      { name: "aliases", type: "string[]", optional: true },
      { name: "properties", type: "string[]", facet: true, optional: true },
      { name: "requirements", type: "string[]", optional: true },
    ],
    enable_nested_fields: true,
  };
}

async function ensureCollection(endpoint: string, apiKey: string, collection: string) {
  const current = await request(endpoint, apiKey, `/collections/${encodeURIComponent(collection)}`);
  if (current.status === 200) return;
  if (current.status !== 404)
    throw new Error(`Typesense collection lookup failed with HTTP ${current.status}`);
  const created = await request(endpoint, apiKey, "/collections", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(collectionSchema(collection)),
  });
  if (created.status !== 200)
    throw new Error(`Typesense collection creation failed with HTTP ${created.status}`);
}

async function importRecords(
  endpoint: string,
  apiKey: string,
  collection: string,
  records: SearchRecord[],
) {
  const body = `${records.map((record) => JSON.stringify(record)).join("\n")}\n`;
  const imported = await request(
    endpoint,
    apiKey,
    `/collections/${encodeURIComponent(collection)}/documents/import?action=upsert`,
    {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body,
    },
  );
  if (imported.status !== 200)
    throw new Error(`Typesense document import failed with HTTP ${imported.status}`);
  const results = imported.body
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => jsonBody(line, "document import"));
  if (results.length !== records.length || results.some((result) => result.success !== true))
    throw new Error("Typesense document import contained one or more failed records");
}

async function pointAlias(endpoint: string, apiKey: string, alias: string, collection: string) {
  const response = await request(endpoint, apiKey, `/aliases/${encodeURIComponent(alias)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ collection_name: collection }),
  });
  if (response.status !== 200)
    throw new Error(`Typesense alias update failed with HTTP ${response.status}`);
  const current = await request(endpoint, apiKey, `/aliases/${encodeURIComponent(alias)}`);
  if (current.status !== 200)
    throw new Error(`Typesense alias read-back failed with HTTP ${current.status}`);
  const body = jsonBody(current.body, "alias read-back");
  if (body.collection_name !== collection)
    throw new Error(
      `Typesense alias read-back targeted ${String(body.collection_name ?? "missing")}, expected ${collection}`,
    );
}

async function search(
  endpoint: string,
  apiKey: string,
  collection: string,
  query: string,
  options: { limit?: number; filterBy?: string; facetBy?: string } = {},
) {
  const params = new URLSearchParams({
    q: query,
    query_by: "title,summary,text,aliases,properties,requirements",
    per_page: String(options.limit ?? 20),
  });
  if (options.filterBy) params.set("filter_by", options.filterBy);
  if (options.facetBy) params.set("facet_by", options.facetBy);
  const response = await request(
    endpoint,
    apiKey,
    `/collections/${encodeURIComponent(collection)}/documents/search?${params.toString()}`,
  );
  if (response.status !== 200)
    throw new Error(`Typesense search failed with HTTP ${response.status}`);
  return jsonBody(response.body, "search");
}

async function count(endpoint: string, apiKey: string, collection: string) {
  const result = await search(endpoint, apiKey, collection, "*", { limit: 1 });
  const found = result.found;
  if (typeof found !== "number" || !Number.isSafeInteger(found))
    throw new Error("Typesense count response was malformed");
  return found;
}

async function assertSearchOnlyCannotWrite(
  endpoint: string,
  searchApiKey: string,
  collection: string,
) {
  const response = await request(
    endpoint,
    searchApiKey,
    `/collections/${encodeURIComponent(collection)}/documents`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    },
  );
  if (response.status !== 401 && response.status !== 403)
    throw new Error(`Typesense search-only key write probe returned HTTP ${response.status}`);
}

async function assertStaticFallback(records: SearchRecord[]) {
  const expected = records.find((record) => record.type === "project") ?? records[0];
  if (!expected) throw new Error("Static search fallback cannot be verified without records");
  const staticProvider = createStaticSearchProvider(records, 0);
  const failingPrimary: SearchProvider = {
    mode: "typesense",
    async search() {
      throw new Error("synthetic Typesense outage");
    },
  };
  const fallback = createFallbackSearchProvider(failingPrimary, staticProvider);
  const result = await fallback.search(expected.title, { limit: 5 });
  if (result.provider !== "static-fallback" || result.degraded !== true)
    throw new Error("Static search fallback did not mark the simulated primary outage as degraded");
  if (!result.results.some((record) => record.id === expected.id))
    throw new Error("Static search fallback did not return the expected public record");
}

async function assertPreviewExclusion(
  endpoint: string,
  adminApiKey: string,
  searchApiKey: string,
  writeCollection: string,
  searchCollection: string,
  indexId: string,
) {
  const id = `paper-slate-preview-permission-probe-${indexId}`;
  const create = await request(
    endpoint,
    adminApiKey,
    `/collections/${encodeURIComponent(writeCollection)}/documents`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        title: "Paper & Slate preview permission probe",
        summary: "temporary preview permission probe",
        text: "temporary preview permission probe",
        route: "/__preview-permission-probe",
        type: "documentation",
        source: "docs",
        visibility: "preview",
      }),
    },
  );
  if (create.status !== 201 && create.status !== 200)
    throw new Error(`Typesense preview probe setup failed with HTTP ${create.status}`);
  let assertionError: unknown;
  try {
    const publicResult = await search(
      endpoint,
      searchApiKey,
      searchCollection,
      "preview permission probe",
      {
        limit: 5,
        filterBy: "visibility:=public",
      },
    );
    if (publicResult.found !== 0)
      throw new Error("Typesense public search exposed a preview record");
  } catch (error) {
    assertionError = error;
  }

  let cleanupError: unknown;
  try {
    const deleted = await request(
      endpoint,
      adminApiKey,
      `/collections/${encodeURIComponent(writeCollection)}/documents/${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );
    if (deleted.status !== 200)
      cleanupError = new Error(
        `Typesense preview probe cleanup failed with HTTP ${deleted.status}`,
      );
  } catch (error) {
    cleanupError = error;
  }
  if (assertionError !== undefined && cleanupError !== undefined)
    throw new AggregateError([assertionError, cleanupError], "Typesense preview probe failed");
  if (assertionError !== undefined) throw assertionError;
  if (cleanupError !== undefined) throw cleanupError;
}

function indexIdFor(records: SearchRecord[]) {
  return `idx-${createHash("sha256").update(JSON.stringify(records)).digest("hex").slice(0, 16)}`;
}

export async function publishTypesenseIndex(
  records: SearchRecord[],
): Promise<TypesenseIndexReport> {
  const endpoint = process.env.TYPESENSE_ENDPOINT;
  const adminApiKey = process.env.TYPESENSE_API_KEY;
  const searchApiKey = process.env.TYPESENSE_SEARCH_API_KEY;
  const baseCollection = process.env.TYPESENSE_COLLECTION ?? defaultAlias;
  const alias = process.env.TYPESENSE_COLLECTION_ALIAS ?? defaultAlias;
  const indexId = process.env.TYPESENSE_INDEX_ID ?? indexIdFor(records);
  const collection = `${baseCollection}__${indexId}`.replace(/[^A-Za-z0-9_-]/g, "_");
  const sourceSha = process.env.GIT_SHA ?? readSourceState(root).commit;
  if (!endpoint || !adminApiKey || !searchApiKey)
    throw new Error(
      "Typesense publishing requires TYPESENSE_ENDPOINT, TYPESENSE_API_KEY, and TYPESENSE_SEARCH_API_KEY",
    );
  if (adminApiKey === searchApiKey)
    throw new Error("Typesense write and search keys must be different");
  if (!sourceSha || !/^[a-f0-9]{40}$/i.test(sourceSha))
    throw new Error("Typesense publishing requires an exact 40-character Git SHA");

  await assertStaticFallback(records);
  await ensureCollection(endpoint, adminApiKey, collection);
  await importRecords(endpoint, adminApiKey, collection, records);
  await pointAlias(endpoint, adminApiKey, alias, collection);
  const documentCount = await count(endpoint, adminApiKey, alias);
  if (documentCount !== records.length)
    throw new Error(
      `Typesense document count mismatch: expected ${records.length}, got ${documentCount}`,
    );

  const projects = records.filter((record) => record.type === "project");
  const documentation = records.filter((record) => record.type === "documentation");
  const news = records.filter((record) => record.type === "news");
  const projectQuery = projects[0]?.title ?? "File System";
  const documentationQuery = documentation[0]?.title ?? "documentation";
  const newsQuery = news[0]?.title ?? "news";
  const projectResult = await search(endpoint, searchApiKey, alias, projectQuery, { limit: 5 });
  const documentationResult = await search(endpoint, searchApiKey, alias, documentationQuery, {
    limit: 5,
  });
  const newsResult = await search(endpoint, searchApiKey, alias, newsQuery, { limit: 5 });
  const aliasResult = await search(endpoint, searchApiKey, alias, "rfc 1", {
    limit: 5,
    facetBy: "type,source",
  });
  if (!Array.isArray(projectResult.hits) || !projectResult.hits.length)
    throw new Error("Typesense project exact-match query returned no records");
  if (!Array.isArray(documentationResult.hits) || !documentationResult.hits.length)
    throw new Error("Typesense documentation query returned no records");
  if (!Array.isArray(newsResult.hits) || !newsResult.hits.length)
    throw new Error("Typesense news query returned no records");
  const topAliasHit = Array.isArray(aliasResult.hits)
    ? (aliasResult.hits[0] as { document?: { id?: unknown } } | undefined)
    : undefined;
  if (topAliasHit?.document?.id !== "rfc:1")
    throw new Error("Typesense alias/ranking query did not rank RFC 1 first");
  if (!Array.isArray(aliasResult.facet_counts) || aliasResult.facet_counts.length < 2)
    throw new Error("Typesense facet query returned incomplete facets");

  // Probe the concrete collection so an alias' search-only semantics cannot
  // mask a permissions failure from the search-only key.
  await assertSearchOnlyCannotWrite(endpoint, searchApiKey, collection);
  await assertPreviewExclusion(endpoint, adminApiKey, searchApiKey, collection, alias, indexId);

  const report: TypesenseIndexReport = {
    schemaVersion: 1,
    status: "passed",
    collection,
    alias,
    indexId,
    buildId: indexId,
    documentCount,
    indexedAt: new Date().toISOString(),
    sourceSha,
    keySeparation: {
      writeIndexStatus: "passed",
      searchStatus: "passed",
      searchWriteStatus: "passed",
    },
    checks: {
      projectExactMatch: "passed",
      documentationMatch: "passed",
      newsMatch: "passed",
      facets: "passed",
      ranking: "passed",
      alias: "passed",
      previewExclusion: "passed",
      staticFallback: "passed",
    },
  };
  await mkdir(path.dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return report;
}
