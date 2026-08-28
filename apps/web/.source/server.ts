// @ts-nocheck
import * as __fd_glob_0 from "../../../content/docs/concepts/provenance.md?collection=docs"
import * as __fd_glob_1 from "../../../content/docs/getting-started/welcome.md?collection=docs"
import * as __fd_glob_2 from "../../../content/docs/governance.md?collection=docs"
import * as __fd_glob_3 from "../../../content/docs/index.md?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();

export const docs = await create.docs("docs", "../../content/docs", {}, {"concepts/provenance.md": __fd_glob_0, "getting-started/welcome.md": __fd_glob_1, "governance.md": __fd_glob_2, "index.md": __fd_glob_3, });