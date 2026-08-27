import { describe, expect, it } from "vitest";
import {
  assertSafeDocument,
  loadRegistry,
  renderMarkdown,
  slugifyHeading,
} from "../packages/docs-ingestion/src";
describe("local docs ingestion", () => {
  it("loads independent next and historical versions", () => {
    const source = loadRegistry().find((item) => item.id === "file-system");
    expect(source?.versions.map((version) => version.id)).toEqual(["next", "v1"]);
  });
  it("rejects unsafe imported content", () => {
    expect(() => assertSafeDocument("unsafe.mdx", 'import x from "x"')).toThrow();
    expect(() => assertSafeDocument("unsafe.md", "<script>x</script>")).toThrow();
    expect(() => assertSafeDocument("unsafe.md", "[escape](../../secret.md)")).toThrow();
  });
  it("renders only escaped markdown", () => {
    expect(renderMarkdown("# Hello")).toContain('id="hello"');
    expect(slugifyHeading("A & B")).toBe("a-b");
  });
});
