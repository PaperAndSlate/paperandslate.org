import type { DocsDocument } from "./types";
export function rewriteDocLinks(content: string, documents: DocsDocument[]): string {
  return content.replace(/\]\((\/docs\/[^)#]+)(#[^)]+)?\)/g, (all, route, anchor = "") => {
    const target = documents.find((doc) =>
      [doc.route, doc.canonicalRoute, ...doc.aliases].includes(route),
    );
    return target ? `](${target.canonicalRoute}${anchor})` : all;
  });
}
