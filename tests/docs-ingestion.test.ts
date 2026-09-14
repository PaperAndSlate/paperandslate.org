import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  assertSafeDocument,
  loadRegistry,
  readLocalSourceFromRoot,
  renderMarkdown,
  rewriteDocumentLinks,
  sha256,
  resolveIncludes,
  slugifyHeading,
} from "../packages/docs-ingestion/src";
describe("local docs ingestion", () => {
  it("loads independent next and historical versions", () => {
    const source = loadRegistry().find((item) => item.id === "file-system");
    expect(source?.versions.map((version) => version.id)).toEqual(["next", "v1"]);
  });

  it("normalizes CRLF and LF source bytes to one canonical document identity", () => {
    const source = loadRegistry().find((item) => item.id === "file-system");
    const version = source?.versions.find((item) => item.id === "next");
    expect(source).toBeDefined();
    expect(version).toBeDefined();
    const lfRoot = fs.mkdtempSync(path.join(os.tmpdir(), "docs-line-ending-lf-"));
    const crlfRoot = fs.mkdtempSync(path.join(os.tmpdir(), "docs-line-ending-crlf-"));
    const document = "---\ntitle: Line endings\n---\n# Hello\n\nBody\n";
    try {
      fs.writeFileSync(path.join(lfRoot, "index.md"), document, "utf8");
      fs.writeFileSync(path.join(crlfRoot, "index.md"), document.replaceAll("\n", "\r\n"), "utf8");
      const lf = readLocalSourceFromRoot(source!, version!, lfRoot)[0];
      const crlf = readLocalSourceFromRoot(source!, version!, crlfRoot)[0];
      expect(crlf.raw).toBe(lf.raw);
      expect(sha256(crlf.raw)).toBe(sha256(lf.raw));
    } finally {
      fs.rmSync(lfRoot, { recursive: true, force: true });
      fs.rmSync(crlfRoot, { recursive: true, force: true });
    }
  });
  it("rejects unsafe imported content", () => {
    expect(() => assertSafeDocument("unsafe.mdx", 'import x from "x"')).toThrow();
    expect(() => assertSafeDocument("unsafe.md", "<script>x</script>")).toThrow();
    expect(() => assertSafeDocument("unsafe.md", "[escape](../../secret.md)")).toThrow();
  });

  it("allows source-root links while keeping escapes rejected", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "eom-link-root-test-"));
    try {
      const docsRoot = path.join(root, "docs");
      fs.mkdirSync(docsRoot, { recursive: true });
      const file = path.join(docsRoot, "index.md");
      expect(() => assertSafeDocument(file, "[README](../README.md)", root)).not.toThrow();
      expect(() => assertSafeDocument(file, "[secret](../../secret.md)", root)).toThrow(
        /Unsafe URL or traversal/,
      );
      expect(() =>
        assertSafeDocument(file, "[secret](%252e%252e/%252e%252e/secret.md)", root),
      ).toThrow(/Unsafe URL or traversal/);
      expect(() =>
        assertSafeDocument(file, "[secret](%252e%252e%252f%252e%252e%252fsecret.md)", root),
      ).toThrow(/Unsafe URL or traversal/);
      expect(() => assertSafeDocument(file, "[secret](%2e%2e/%ZZ/secret.md)", root)).toThrow(
        /Unsafe URL or traversal/,
      );
      expect(() => assertSafeDocument(file, "[secret](..\\..\\secret.md)", root)).toThrow(
        /Unsafe URL or traversal/,
      );
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("rejects encoded unsafe URL schemes", () => {
    expect(() => assertSafeDocument("unsafe.md", "[script](java%73cript%3Aalert)")).toThrow(
      /Unsafe URL or traversal/,
    );
  });

  it("rewrites same-source documents and makes unresolved source links inert", () => {
    const base = {
      id: "source:next:index",
      route: "/docs/source/next",
      canonicalRoute: "/docs/source",
      aliases: [],
      project: "source",
      version: "next",
      sourceId: "source",
      sourcePath: "index.md",
      headings: [],
      hash: "a".repeat(64),
      status: "draft" as const,
      ref: "local",
      sourceMode: "fixture" as const,
      sourceHash: "a".repeat(64),
      requirementAnchors: [],
      taxonomy: [],
      assets: [],
      title: "Index",
    };
    const guide = {
      ...base,
      id: "source:next:guide",
      sourcePath: "guide.md",
      route: "/docs/source/next/guide",
      canonicalRoute: "/docs/source/guide",
      title: "Guide",
    };
    const current = {
      ...base,
      content: "[Guide](guide.md) [README](../README.md) [Missing](missing)",
    };
    const rewritten = rewriteDocumentLinks([current, { ...guide, content: "Guide" }]);
    expect(rewritten[0].content).toBe("[Guide](/docs/source/guide) README Missing");
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
