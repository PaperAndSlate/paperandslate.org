// source.config.ts
import { defineDocs } from "fumadocs-mdx/config";
var docs = defineDocs({
  dir: "../../content/docs",
  docs: {
    files: ["**/*.md"],
    compiler: "mdx"
  }
});
export {
  docs
};
