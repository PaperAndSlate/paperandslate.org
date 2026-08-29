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
  const internalRoute = (() => {
    if (
      !record.route.startsWith("/") ||
      record.route.startsWith("//") ||
      record.route.includes("\\") ||
      [...record.route].some((character) => {
        const code = character.charCodeAt(0);
        return code < 32 || code === 127;
      })
    )
      return false;
    try {
      return (
        new URL(record.route, "https://paper-and-slate.invalid").origin ===
        "https://paper-and-slate.invalid"
      );
    } catch {
      return false;
    }
  })();
  if (
    !record.id ||
    !record.title ||
    !record.summary ||
    !internalRoute ||
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
