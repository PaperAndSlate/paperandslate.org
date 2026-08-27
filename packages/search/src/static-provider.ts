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
const cache = new Map<string, { expires: number; response: SearchResponse }>();
export function createStaticSearchProvider(
  records: SearchRecord[],
  ttlMs = 30_000,
): SearchProvider {
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
      const cached = cache.get(key);
      if (cached && cached.expires > Date.now()) return cached.response;
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
      cache.set(key, { expires: Date.now() + ttlMs, response });
      return response;
    },
  };
}
