// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  docs: create.doc("docs", {"concepts/provenance.md": () => import("../../../content/docs/concepts/provenance.md?collection=docs"), "getting-started/welcome.md": () => import("../../../content/docs/getting-started/welcome.md?collection=docs"), "governance.md": () => import("../../../content/docs/governance.md?collection=docs"), "index.md": () => import("../../../content/docs/index.md?collection=docs"), }),
};
export default browserCollections;