import fs from "node:fs";
import path from "node:path";
import type { DocsDocument } from "./types";
import { slugifyHeading } from "./markdown";
export function validateDocuments(documents: DocsDocument[]): void {
  const ids = new Set<string>();
  const routes = new Map<string, string>();
  for (const doc of documents) {
    if (ids.has(doc.id)) throw new Error(`Duplicate document id: ${doc.id}`);
    ids.add(doc.id);
    for (const route of [doc.route, doc.canonicalRoute, ...(doc.aliases ?? [])]) {
      const owner = routes.get(route);
      if (owner && owner !== doc.id)
        throw new Error(`Route collision: ${route} (${owner}, ${doc.id})`);
      routes.set(route, doc.id);
    }
    const anchors = new Set<string>();
    for (const heading of doc.headings) {
      const anchor = slugifyHeading(heading.replace(/\s+#$/, ""));
      if (anchors.has(anchor)) throw new Error(`Anchor collision #${anchor} in ${doc.id}`);
      anchors.add(anchor);
    }
    for (const link of doc.content.matchAll(/\]\((#[^)\s]+)(?:\s+[^)]*)?\)/g))
      if (!anchors.has(slugifyHeading(link[1].slice(1))))
        throw new Error(`Broken anchor ${link[1]} in ${doc.id}`);
    for (const link of doc.content.matchAll(/\]\((\/docs\/[^)#\s]+)(#[^)\s]+)?\)/g)) {
      const target = documents.find((candidate) =>
        [candidate.route, candidate.canonicalRoute, ...(candidate.aliases ?? [])].includes(link[1]),
      );
      if (!target) throw new Error(`Broken link ${link[1]} in ${doc.id}`);
      if (link[2]) {
        const targetAnchors = new Set(
          target.headings.map((heading) => slugifyHeading(heading.replace(/\s+#$/, ""))),
        );
        if (!targetAnchors.has(slugifyHeading(link[2].slice(1))))
          throw new Error(`Broken anchor ${link[2]} in ${doc.id}`);
      }
    }
  }
}
export function discoverFiles(root: string): string[] {
  if (!fs.existsSync(root)) throw new Error(`Missing docs root: ${root}`);
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`Symlink is not allowed: ${file}`);
      if (entry.isDirectory()) walk(file);
      else if (/\.(md|mdx)$/i.test(entry.name)) out.push(file);
      else if (/\.(svg|html|js|ts)$/i.test(entry.name))
        throw new Error(`Unsupported source asset: ${file}`);
    }
  };
  walk(root);
  return out.sort();
}
