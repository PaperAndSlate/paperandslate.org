import { normalizedQuery } from "./ranking";
import { normalizeRecord } from "./records";
import type { SearchOptions, SearchRecord, SearchResponse } from "./types";
import type { SearchProvider } from "./static-provider";
export type TypesenseConfig = {
  endpoint: string;
  apiKey: string;
  collection?: string;
  indexId?: string;
  maxRetries?: number;
};

const limitFor = (options?: SearchOptions) => Math.max(1, Math.min(options?.limit ?? 20, 20));

export function createTypesenseProvider(config?: TypesenseConfig): SearchProvider | null {
  if (!config?.endpoint || !config.apiKey) return null;
  const collection = config.collection ?? "search_records";
  const maxRetries = Math.max(0, Math.min(config.maxRetries ?? 1, 2));

  return {
    mode: "typesense",
    async search(query: string, options?: SearchOptions): Promise<SearchResponse> {
      const normalized = normalizedQuery(query);
      if (!normalized)
        return {
          query: "",
          results: [],
          total: 0,
          facets: { type: {}, source: {} },
          provider: "typesense",
          truncated: false,
          indexId: config.indexId,
        };
      let lastError: unknown;
      for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
        const controller = new AbortController();
        const timeout = setTimeout(
          () => controller.abort(),
          Math.max(100, Math.min(options?.timeoutMs ?? 750, 2000)),
        );
        const abort = () => controller.abort();
        options?.signal?.addEventListener("abort", abort, { once: true });
        try {
          const params = new URLSearchParams({
            q: normalized,
            query_by: "title,summary,text,aliases,properties,requirements",
            per_page: String(limitFor(options)),
            facet_by: "type,source",
          });
          if (!options?.includePreview) params.set("filter_by", "visibility:=public");
          if (options?.filters?.type)
            params.set(
              "filter_by",
              `${params.get("filter_by") ? `${params.get("filter_by")} && ` : ""}type:=${options.filters.type}`,
            );
          if (options?.filters?.source)
            params.set(
              "filter_by",
              `${params.get("filter_by") ? `${params.get("filter_by")} && ` : ""}source:=${options.filters.source}`,
            );
          const url = `${config.endpoint.replace(/\/$/, "")}/collections/${encodeURIComponent(collection)}/documents/search?${params.toString()}`;
          const response = await fetch(url, {
            headers: { "X-TYPESENSE-API-KEY": config.apiKey, Accept: "application/json" },
            signal: controller.signal,
          });
          if (!response.ok) throw new Error(`Typesense provider returned ${response.status}`);
          const data = (await response.json()) as {
            hits?: Array<{ document?: SearchRecord; text_match_info?: { score?: number } }>;
            found?: number;
            facet_counts?: Array<{
              field_name: string;
              counts: Array<{ value: string; count: number }>;
            }>;
          };
          if (!Array.isArray(data.hits))
            throw new Error("Typesense provider returned malformed results");
          const results = data.hits.flatMap((hit) => {
            if (!hit.document) throw new Error("Typesense provider returned a malformed document");
            const document = normalizeRecord(hit.document);
            return [
              { ...document, score: hit.text_match_info?.score ?? 0, snippet: document.summary },
            ];
          });
          const facets = { type: {}, source: {} } as SearchResponse["facets"];
          for (const facet of data.facet_counts ?? []) {
            const target =
              facet.field_name === "type" || facet.field_name === "source"
                ? facets[facet.field_name]
                : null;
            if (target) for (const count of facet.counts ?? []) target[count.value] = count.count;
          }
          return {
            query: normalized,
            results,
            total: data.found ?? results.length,
            facets,
            provider: "typesense",
            truncated: results.length >= limitFor(options),
            indexId: config.indexId,
          };
        } catch (error) {
          lastError = error;
          if (options?.signal?.aborted) throw error;
          if (attempt < maxRetries) continue;
        } finally {
          clearTimeout(timeout);
          options?.signal?.removeEventListener("abort", abort);
        }
      }
      throw lastError instanceof Error ? lastError : new Error("Typesense provider unavailable");
    },
  };
}

export function createFallbackSearchProvider(
  primary: SearchProvider | null,
  fallback: SearchProvider,
): SearchProvider {
  return {
    mode: primary ? "typesense-with-static-fallback" : fallback.mode,
    async search(query, options) {
      if (!primary) return fallback.search(query, options);
      try {
        return await primary.search(query, options);
      } catch {
        const response = await fallback.search(query, options);
        return { ...response, provider: "static-fallback", degraded: true };
      }
    },
  };
}
