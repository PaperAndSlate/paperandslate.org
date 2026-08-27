import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import type { DocsSource } from "./types";
export function loadRegistry(file = "config/docs-sources.yml"): DocsSource[] {
  const parsed = parseYaml(fs.readFileSync(file, "utf8")) as { sources?: DocsSource[] };
  if (!Array.isArray(parsed.sources)) throw new Error("Registry sources are required");
  const ids = new Set<string>();
  for (const source of parsed.sources) {
    if (ids.has(source.id)) throw new Error(`Duplicate source: ${source.id}`);
    ids.add(source.id);
    if (!source.versions?.length) throw new Error(`Source has no versions: ${source.id}`);
    if (source.kind === "git" && !source.approved)
      throw new Error(`Git source is not approved: ${source.id}`);
    for (const version of source.versions)
      if (source.kind === "git" && !/^[a-f0-9]{40}$/.test(version.gitSha ?? ""))
        throw new Error(`Git source requires a resolved SHA: ${source.id}/${version.id}`);
  }
  return parsed.sources;
}
export function sourceDocsRoot(
  source: DocsSource,
  version: DocsSource["versions"][number],
  cwd = process.cwd(),
): string {
  return path.resolve(cwd, source.root, version.docs ?? "");
}
