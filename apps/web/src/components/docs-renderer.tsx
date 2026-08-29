import { createElement, type ReactNode } from "react";
import { DocsBody } from "fumadocs-ui/page";
import type { DocsDocument } from "../../../../packages/docs-ingestion/src/types";
import { isReviewedCentral, renderCentralMdx } from "../lib/docs-fumadocs";
import { slugifyHeading } from "../../../../packages/docs-ingestion/src/markdown";

function safeHref(value: string): string | null {
  const href = value.trim();
  if (
    !href ||
    href.includes("\\") ||
    href.includes("..") ||
    /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(href) ||
    !(href.startsWith("/") || href.startsWith("#") || /^[a-z\d][a-z\d/_#?=&.%+-]*$/i.test(href))
  )
    return null;
  return href;
}

function renderInline(value: string): ReactNode {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  const pattern = /\[([^\]]+)\]\(([^)\s]+)\)|`([^`]+)`/g;
  for (const match of value.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > cursor) nodes.push(value.slice(cursor, index));
    if (match[3]) nodes.push(createElement("code", { key: `${index}-code` }, match[3]));
    else {
      const href = safeHref(match[2]);
      nodes.push(
        href
          ? createElement("a", { key: `${index}-link`, href }, match[1])
          : `${match[1]} (${match[2]})`,
      );
    }
    cursor = index + match[0].length;
  }
  if (cursor < value.length) nodes.push(value.slice(cursor));
  return nodes.length === 1 ? nodes[0] : nodes;
}

/** Render imported and fixture Markdown as inert React text/elements. */
export function renderRestrictedMarkdown(markdown: string): ReactNode {
  return markdown.split(/\n\s*\n/).map((block, index) => {
    const trimmed = block.trim();
    if (!trimmed) return null;
    const heading = /^(#{1,6})\s+(.+)$/.exec(trimmed);
    if (heading) {
      const level = heading[1].length as 1 | 2 | 3 | 4 | 5 | 6;
      const text = heading[2].replace(/\s+#$/, "");
      return createElement(
        `h${level}`,
        { key: index, id: slugifyHeading(text) },
        renderInline(text),
      );
    }
    const lines = trimmed.split("\n");
    if (lines.every((line) => line.trimStart().startsWith("- "))) {
      return createElement(
        "ul",
        { key: index },
        lines.map((line, itemIndex) =>
          createElement("li", { key: itemIndex }, renderInline(line.trimStart().slice(2))),
        ),
      );
    }
    return createElement("p", { key: index }, renderInline(trimmed.replace(/\n/g, " ")));
  });
}

export async function DocsRenderer({ doc }: { doc: DocsDocument }) {
  const body = isReviewedCentral(doc)
    ? await renderCentralMdx(doc)
    : renderRestrictedMarkdown(doc.content);
  return <DocsBody className="prose docs-body">{body}</DocsBody>;
}
