import fs from "node:fs";
import path from "node:path";
import type { DocsDocument } from "./types";
import {
  extractMarkdownLinks,
  firstMarkdownLinkDestination,
  slugifyHeading,
  stripClosingHeadingMarker,
} from "./markdown";
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
      const anchor = slugifyHeading(stripClosingHeadingMarker(heading));
      if (anchors.has(anchor)) throw new Error(`Anchor collision #${anchor} in ${doc.id}`);
      anchors.add(anchor);
    }
    for (const link of extractMarkdownLinks(doc.content)) {
      const target = firstMarkdownLinkDestination(link.rawTarget);
      if (target.startsWith("#") && !anchors.has(slugifyHeading(target.slice(1))))
        throw new Error(`Broken anchor ${target} in ${doc.id}`);
    }
    for (const link of extractMarkdownLinks(doc.content)) {
      const targetUrl = firstMarkdownLinkDestination(link.rawTarget);
      const anchorIndex = targetUrl.indexOf("#");
      const route = anchorIndex < 0 ? targetUrl : targetUrl.slice(0, anchorIndex);
      const anchor = anchorIndex < 0 ? undefined : targetUrl.slice(anchorIndex + 1);
      if (!route.startsWith("/docs/")) continue;
      const targetDocument = documents.find((candidate) =>
        [candidate.route, candidate.canonicalRoute, ...(candidate.aliases ?? [])].includes(route),
      );
      if (!targetDocument) throw new Error(`Broken link ${route} in ${doc.id}`);
      if (anchor) {
        const targetAnchors = new Set(
          targetDocument.headings.map((heading) =>
            slugifyHeading(stripClosingHeadingMarker(heading)),
          ),
        );
        if (!targetAnchors.has(slugifyHeading(anchor)))
          throw new Error(`Broken anchor #${anchor} in ${doc.id}`);
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
