import type { SearchRecord } from "./types";
const types = new Set([
  "project",
  "documentation",
  "governance",
  "rfc",
  "decision",
  "policy",
  "news",
  "report",
]);
const sources = new Set(["content", "docs", "governance", "news"]);
export function normalizeRecord(input: SearchRecord): SearchRecord {
  const record = {
    ...input,
    title: input.title.trim(),
    summary: input.summary.trim(),
    route: input.route.trim(),
    visibility: input.visibility ?? "public",
  };
  if (
    !record.id ||
    !record.title ||
    !record.summary ||
    !record.route.startsWith("/") ||
    !types.has(record.type) ||
    !sources.has(record.source) ||
    (record.visibility !== "public" && record.visibility !== "preview")
  )
    throw new Error(`Invalid search record: ${input.id}`);
  return record;
}
export function normalizeRecords(records: SearchRecord[]): SearchRecord[] {
  const seen = new Set<string>();
  return records.map(normalizeRecord).filter((record) => {
    if (seen.has(record.id)) throw new Error(`Duplicate search record: ${record.id}`);
    seen.add(record.id);
    return true;
  });
}
