import { facetsFor, normalizedQuery, rankRecords } from "./ranking";
import {
  SEARCH_MAX_RESULTS,
  SEARCH_TIMEOUT_MS,
  type SearchOptions,
  type SearchRecord,
  type SearchResponse,
} from "./types";
export type SearchProvider = {
  mode: string;
  search(query: string, options?: SearchOptions): Promise<SearchResponse>;
};
const MAX_CACHE_ENTRIES = 256;
const MAX_CACHE_RESPONSE_BYTES = 512 * 1024;
export function createStaticSearchProvider(
  records: SearchRecord[],
  ttlMs = 30_000,
): SearchProvider {
  const cache = new Map<string, { expires: number; response: SearchResponse }>();
  const readCache = (key: string): SearchResponse | undefined => {
    const cached = cache.get(key);
    if (!cached) return undefined;
    if (cached.expires <= Date.now()) {
      cache.delete(key);
      return undefined;
    }
    cache.delete(key);
    cache.set(key, cached);
    return cached.response;
  };
  const writeCache = (key: string, response: SearchResponse) => {
    if (
      ttlMs <= 0 ||
      Buffer.byteLength(JSON.stringify(response), "utf8") > MAX_CACHE_RESPONSE_BYTES
    )
      return;
    cache.delete(key);
    while (cache.size >= MAX_CACHE_ENTRIES) cache.delete(cache.keys().next().value!);
    cache.set(key, { expires: Date.now() + ttlMs, response });
  };
  return {
    mode: "static",
    async search(query, options = {}) {
      const normalized = normalizedQuery(query);
      if (options.signal?.aborted) throw new DOMException("Search cancelled", "AbortError");
      const key = JSON.stringify([
        normalized,
        options.limit,
        options.filters,
        options.includePreview,
      ]);
      const cached = readCache(key);
      if (cached) return cached;
      const started = Date.now();
      const eligible = records.filter(
        (record) =>
          (options.includePreview || record.visibility !== "preview") &&
          (!options.filters?.type || record.type === options.filters.type) &&
          (!options.filters?.source || record.source === options.filters.source),
      );
      const results = rankRecords(records, normalized, options);
      if (
        Date.now() - started >
        Math.min(Math.max(options.timeoutMs ?? SEARCH_TIMEOUT_MS, 1), SEARCH_TIMEOUT_MS)
      )
        throw new Error("Search timed out");
      const response: SearchResponse = {
        query: normalized,
        results,
        total: results.length,
        facets: facetsFor(eligible),
        provider: "static-fallback",
        truncated:
          results.length >= Math.min(options.limit ?? SEARCH_MAX_RESULTS, SEARCH_MAX_RESULTS),
        indexId: "static-local",
      };
      writeCache(key, response);
      return response;
    },
  };
}
