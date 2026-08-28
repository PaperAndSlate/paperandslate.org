import { describe, expect, it } from "vitest";
import {
  sortBrowserCollections,
  sortServerCollections,
} from "../scripts/normalize-fumadocs-source";

describe("Fumadocs generated source ordering", () => {
  it("sorts browser collection entries and is idempotent", () => {
    const source = `const browserCollections = {
  docs: create.doc("docs", {"z.md": () => import("./z.md"), "a.md": () => import("./a.md"), }),
};`;
    const normalized = sortBrowserCollections(source);

    expect(normalized.indexOf('"a.md"')).toBeLessThan(normalized.indexOf('"z.md"'));
    expect(sortBrowserCollections(normalized)).toBe(normalized);
  });

  it("sorts server imports, renumbers them, and sorts object entries", () => {
    const source = `// @ts-nocheck
import * as __fd_glob_0 from "./z.md"
import * as __fd_glob_1 from "./a.md"
import { server } from "fumadocs-mdx/runtime/server";

export const docs = await create.docs("docs", "content", {}, {"z.md": __fd_glob_0, "a.md": __fd_glob_1, });`;
    const normalized = sortServerCollections(source);

    expect(normalized.indexOf('from "./a.md"')).toBeLessThan(normalized.indexOf('from "./z.md"'));
    expect(normalized.indexOf('"a.md": __fd_glob_0')).toBeLessThan(
      normalized.indexOf('"z.md": __fd_glob_1'),
    );
    expect(sortServerCollections(normalized)).toBe(normalized);
  });
});
