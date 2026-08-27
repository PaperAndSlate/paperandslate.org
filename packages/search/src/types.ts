export const SEARCH_MAX_QUERY_LENGTH = 120;
export const SEARCH_MAX_RESULTS = 20;
export const SEARCH_TIMEOUT_MS = 750;
export type SearchContentType =
  | "project"
  | "documentation"
  | "governance"
  | "rfc"
  | "decision"
  | "policy"
  | "news"
  | "report";
export type SearchSource = "content" | "docs" | "governance" | "news";
export type SearchVisibility = "public" | "preview";
export type SearchRecord = {
  id: string;
  title: string;
  summary: string;
  text?: string;
  route: string;
  type: SearchContentType;
  source: SearchSource;
  visibility?: SearchVisibility;
  date?: string;
  aliases?: string[];
  properties?: string[];
  requirements?: string[];
};
export type SearchFacets = { type: Record<string, number>; source: Record<string, number> };
export type SearchFilters = { type?: SearchContentType; source?: SearchSource };
export type SearchOptions = {
  limit?: number;
  filters?: SearchFilters;
  includePreview?: boolean;
  signal?: AbortSignal;
  timeoutMs?: number;
};
export type SearchResult = SearchRecord & { score: number; snippet: string };
export type SearchResponse = {
  query: string;
  results: SearchResult[];
  total: number;
  facets: SearchFacets;
  provider: string;
  truncated: boolean;
  degraded?: boolean;
  indexId?: string;
};
