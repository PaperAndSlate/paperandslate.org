import {
  SEARCH_MAX_QUERY_LENGTH,
  SEARCH_MAX_RESULTS,
  type SearchFacets,
  type SearchOptions,
  type SearchRecord,
  type SearchResult,
} from "./types";
const normalize = (value: string) => value.normalize("NFKC").trim().toLowerCase();
export const normalizedQuery = (query: string) =>
  normalize(query).slice(0, SEARCH_MAX_QUERY_LENGTH);
export function facetsFor(records: SearchRecord[]): SearchFacets {
  const facets: SearchFacets = { type: {}, source: {} };
  for (const record of records) {
    facets.type[record.type] = (facets.type[record.type] ?? 0) + 1;
    facets.source[record.source] = (facets.source[record.source] ?? 0) + 1;
  }
  return facets;
}
export function rankRecords(
  records: SearchRecord[],
  query: string,
  options: SearchOptions = {},
): SearchResult[] {
  const q = normalizedQuery(query);
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);
  const limit = Math.max(1, Math.min(options.limit ?? SEARCH_MAX_RESULTS, SEARCH_MAX_RESULTS));
  return records
    .filter(
      (record) =>
        (options.includePreview || record.visibility !== "preview") &&
        (!options.filters?.type || record.type === options.filters.type) &&
        (!options.filters?.source || record.source === options.filters.source),
    )
    .map((record) => {
      const title = normalize(record.title),
        summary = normalize(record.summary),
        text = normalize(record.text ?? ""),
        aliases = (record.aliases ?? []).map(normalize);
      const exact = title === q ? 100 : title.includes(q) ? 60 : 0;
      const exactAlias = aliases.some((alias) => alias === q)
        ? 90
        : aliases.some((alias) => alias.includes(q))
          ? 45
          : 0;
      const exactRfc =
        record.type === "rfc" && /^rfc[:\s-]?\d+$/.test(q) && aliases.includes(q) ? 140 : 0;
      const exactProperty = (record.properties ?? []).some((property) => normalize(property) === q)
        ? 120
        : 0;
      const exactRequirement = (record.requirements ?? []).some(
        (requirement) => normalize(requirement) === q,
      )
        ? 120
        : 0;
      const score =
        exactRfc +
        exactProperty +
        exactRequirement +
        exact +
        exactAlias +
        terms.reduce(
          (n, term) =>
            n +
            (title.includes(term) ? 20 : 0) +
            (summary.includes(term) ? 8 : 0) +
            (text.includes(term) ? 2 : 0),
          0,
        );
      return { ...record, score, snippet: record.summary };
    })
    .filter((record) => record.score > 0)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title) || a.id.localeCompare(b.id))
    .slice(0, limit);
}
