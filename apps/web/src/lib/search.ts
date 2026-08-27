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
        collection: env.TYPESENSE_COLLECTION,
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
