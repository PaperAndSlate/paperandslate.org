import { compile, run } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import { DocsBody } from "fumadocs-ui/page";
import type { DocsDocument } from "../../../../packages/docs-ingestion/src/types";
import { mdxComponents } from "../../mdx-components";
import { isReviewedCentral, renderCentralMdx } from "../lib/docs-fumadocs";

async function compileDocument(doc: DocsDocument) {
  const compiled = await compile(
    { value: doc.content, path: doc.sourcePath },
    { outputFormat: "function-body" },
  );
  const evaluated = await run(compiled, { ...runtime, baseUrl: import.meta.url });
  const Content = evaluated.default;
  return <Content components={mdxComponents} />;
}

export async function DocsRenderer({ doc }: { doc: DocsDocument }) {
  const body = isReviewedCentral(doc) ? await renderCentralMdx(doc) : await compileDocument(doc);
  return <DocsBody className="prose docs-body">{body}</DocsBody>;
}
