import records from "../../../../.generated/search/search-records.json";
import { parseEnv } from "@paper-and-slate/config";
import {
  createFallbackSearchProvider,
  createStaticSearchProvider,
  createTypesenseProvider,
  normalizeRecords,
  type SearchOptions,
  type SearchRecord,
  type SearchResponse,
} from "@paper-and-slate/search";
const env = parseEnv();
const staticProvider = createStaticSearchProvider(normalizeRecords(records as SearchRecord[]));
const configuredProvider =
  env.SEARCH_PROVIDER === "typesense"
    ? createTypesenseProvider({
        endpoint: env.TYPESENSE_ENDPOINT ?? "",
        apiKey: env.TYPESENSE_SEARCH_API_KEY ?? "",
        collection: env.TYPESENSE_COLLECTION_ALIAS,
        indexId: process.env.TYPESENSE_INDEX_ID,
      })
    : null;
export const searchProvider = createFallbackSearchProvider(configuredProvider, staticProvider);
export const searchLocal = (query: string, options?: SearchOptions): Promise<SearchResponse> =>
  searchProvider.search(query, options);
export const searchStatus = {
  configured: Boolean(configuredProvider),
  mode: configuredProvider ? "typesense-with-static-fallback" : "static-fallback",
  indexId: process.env.TYPESENSE_INDEX_ID ?? "static-local",
};

export type SearchProviderStatus = "disabled" | "ready" | "empty" | "unavailable";
export type SearchHealth = {
  mode: string;
  configured: boolean;
  ready: boolean;
  fallbackReady: boolean;
  providerReady: boolean;
  providerStatus: SearchProviderStatus;
  indexId: string;
};

/**
 * `ready` describes the public search service, which includes its static fallback.
 * `providerReady` is deliberately separate so configured environment variables
 * cannot be mistaken for a healthy Typesense collection.
 */
export function searchHealthFor(
  providerStatus: SearchProviderStatus,
  fallbackReady: boolean,
): SearchHealth {
  return {
    ...searchStatus,
    ready: fallbackReady,
    fallbackReady,
    providerReady: providerStatus === "ready",
    providerStatus,
  };
}

const SEARCH_PROBE_QUERY = "paper";
const SEARCH_HEALTH_CACHE_MS = 15_000;
let cachedSearchHealth: { expiresAt: number; value: SearchHealth } | null = null;
let searchHealthProbe: Promise<SearchHealth> | null = null;

async function probeSearchHealth(): Promise<SearchHealth> {
  let fallbackReady = true;
  try {
    await staticProvider.search(SEARCH_PROBE_QUERY, { limit: 1, timeoutMs: 500 });
  } catch {
    fallbackReady = false;
  }

  if (!configuredProvider)
    return searchHealthFor(fallbackReady ? "disabled" : "unavailable", fallbackReady);

  try {
    const response = await configuredProvider.search(SEARCH_PROBE_QUERY, {
      limit: 1,
      timeoutMs: 500,
    });
    const providerStatus =
      response.provider === "typesense" && response.total > 0 ? "ready" : "empty";
    return searchHealthFor(providerStatus, fallbackReady);
  } catch {
    return searchHealthFor("unavailable", fallbackReady);
  }
}

/** Run a bounded provider probe while retaining a short cache for frequent health requests. */
export async function getSearchHealth(): Promise<SearchHealth> {
  if (cachedSearchHealth && cachedSearchHealth.expiresAt > Date.now())
    return cachedSearchHealth.value;
  if (!searchHealthProbe) {
    searchHealthProbe = probeSearchHealth().then((value) => {
      cachedSearchHealth = { expiresAt: Date.now() + SEARCH_HEALTH_CACHE_MS, value };
      return value;
    });
  }
  try {
    return await searchHealthProbe;
  } finally {
    searchHealthProbe = null;
  }
}
