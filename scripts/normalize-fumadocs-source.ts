import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

type GeneratedEntry = { key: string; value: string };

const compareCodePoints = (left: string, right: string) =>
  left < right ? -1 : left > right ? 1 : 0;

const decodeString = (value: string) => JSON.parse(value) as string;

const assertOnlyEntries = (body: string, entryPattern: RegExp, fileName: string) => {
  const entries = [...body.matchAll(entryPattern)];
  if (entries.length === 0 || body.replace(entryPattern, "").trim()) {
    throw new Error(`Unexpected Fumadocs generated entry format in ${fileName}`);
  }
  return entries;
};

export function sortBrowserCollections(source: string) {
  const collectionPattern = /(create\.doc\("[^"]+",\s*\{)([\s\S]*?)(\}\),)/g;
  const entryPattern = /"((?:\\.|[^"\\])*)": \(\) => import\("((?:\\.|[^"\\])*)"\), /g;

  return source.replace(
    collectionPattern,
    (match, prefix: string, body: string, suffix: string) => {
      const entries: GeneratedEntry[] = assertOnlyEntries(body, entryPattern, "browser.ts").map(
        (entry) => ({
          key: decodeString(`"${entry[1]}"`),
          value: decodeString(`"${entry[2]}"`),
        }),
      );
      entries.sort((left, right) => compareCodePoints(left.key, right.key));
      return `${prefix}${entries
        .map(
          (entry) => `${JSON.stringify(entry.key)}: () => import(${JSON.stringify(entry.value)}), `,
        )
        .join("")}${suffix}`;
    },
  );
}

export function sortServerCollections(source: string) {
  const importPattern = /^import \* as (__fd_glob_\d+) from ("(?:\\.|[^"\\])*")(?:\r?\n|$)/gm;
  const imports = [...source.matchAll(importPattern)].map((entry) => ({
    name: entry[1],
    path: decodeString(entry[2]),
  }));
  if (imports.length === 0) return source;

  imports.sort((left, right) => compareCodePoints(left.path, right.path));
  const renamed = new Map(
    imports.map((entry, index) => [entry.name, `__fd_glob_${index}`] as const),
  );
  const importBlock = imports
    .map((entry, index) => `import * as __fd_glob_${index} from ${JSON.stringify(entry.path)}`)
    .join("\n");
  const remappedWithoutImports = source
    .replace(importPattern, "")
    .replace(/\b__fd_glob_\d+\b/g, (name) => renamed.get(name) ?? name);
  const firstLineEnd = remappedWithoutImports.indexOf("\n");
  if (firstLineEnd < 0) throw new Error("Unexpected Fumadocs server.ts header format");
  const normalized = `${remappedWithoutImports.slice(0, firstLineEnd + 1)}${importBlock}\n${remappedWithoutImports.slice(firstLineEnd + 1)}`;

  const collectionPattern = /(,\s*\{)([^{}]*\b__fd_glob_\d+\b[^{}]*)(\}\);)/g;
  const entryPattern = /"((?:\\.|[^"\\])*)": (__fd_glob_\d+), /g;
  return normalized.replace(
    collectionPattern,
    (match, prefix: string, body: string, suffix: string) => {
      const entries: GeneratedEntry[] = assertOnlyEntries(body, entryPattern, "server.ts").map(
        (entry) => ({ key: decodeString(`"${entry[1]}"`), value: entry[2] }),
      );
      entries.sort((left, right) => compareCodePoints(left.key, right.key));
      return `${prefix}${entries
        .map((entry) => `${JSON.stringify(entry.key)}: ${entry.value}, `)
        .join("")}${suffix}`;
    },
  );
}

export function normalizeFumadocsSource(
  root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."),
) {
  const sourceRoot = path.join(root, "apps", "web", ".source");
  const files = [
    ["browser.ts", sortBrowserCollections],
    ["server.ts", sortServerCollections],
  ] as const;

  for (const [fileName, normalize] of files) {
    const filePath = path.join(sourceRoot, fileName);
    if (!existsSync(filePath)) throw new Error(`Missing Fumadocs generated file: ${filePath}`);
    const source = readFileSync(filePath, "utf8");
    const normalized = normalize(source);
    if (normalized !== source) writeFileSync(filePath, normalized, "utf8");
  }
}
