import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  assertSafeDocument,
  loadRegistry,
  renderMarkdown,
  resolveIncludes,
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

  it("rejects repeated include expansion before it exceeds the budget", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "eom-include-count-test-"));
    try {
      const leaf = path.join(root, "leaf.md");
      fs.writeFileSync(leaf, "leaf\n");
      const content = Array.from({ length: 129 }, () => "{{ include leaf.md }}").join("\n");
      expect(() => resolveIncludes(content, path.join(root, "root.md"), root)).toThrow(
        /Include count exceeds/,
      );
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("rejects an include chain deeper than the configured depth", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "eom-include-depth-test-"));
    try {
      for (let index = 0; index < 34; index += 1) {
        const next = index === 33 ? "done\n" : `{{ include ${index + 1}.md }}`;
        fs.writeFileSync(path.join(root, `${index}.md`), next);
      }
      expect(() => resolveIncludes("{{ include 0.md }}", path.join(root, "root.md"), root)).toThrow(
        /Include depth exceeds/,
      );
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("rejects expanded output before building an oversized document", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "eom-include-bytes-test-"));
    try {
      fs.writeFileSync(path.join(root, "leaf.md"), "x".repeat(200 * 1024));
      const content = "{{ include leaf.md }}\n{{ include leaf.md }}";
      expect(() => resolveIncludes(content, path.join(root, "root.md"), root)).toThrow(
        /Expanded document exceeds/,
      );
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
