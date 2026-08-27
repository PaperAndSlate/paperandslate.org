import { defineDocs } from "fumadocs-mdx/config";

// This collection is limited to the repository-owned central Markdown tree.
// Imported and fixture records are never part of this graph.
export const docs = defineDocs({
  dir: "../../content/docs",
  docs: {
    files: ["**/*.md"],
    compiler: "mdx",
  },
});
