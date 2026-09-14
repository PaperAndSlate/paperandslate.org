import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import {
  assertSafeDocument,
  escapeHtmlAttribute,
  extractMarkdownLinks,
  readLocalSourceFromRoot,
  renderMarkdown,
  resolveIncludes,
} from "../packages/docs-ingestion/src";

describe("documentation ingestion security boundaries", () => {
  it("parses adversarial link-like input in one bounded pass", () => {
    const malformed = `[${"x".repeat(120_000)}`;
    expect(extractMarkdownLinks(malformed)).toEqual([]);
    expect(() => assertSafeDocument("unsafe.md", malformed)).not.toThrow();

    const links = extractMarkdownLinks(
      Array.from({ length: 2_000 }, (_, index) => `[link-${index}](guide-${index}.md)`).join(" "),
    );
    expect(links).toHaveLength(2_000);
    expect(links[1]).toMatchObject({ label: "link-1", rawTarget: "guide-1.md" });
  });

  it("rejects duplicate headings with the bounded heading scanner", () => {
    expect(() => assertSafeDocument("unsafe.md", "# Same\n\n# Same")).toThrow(/Duplicate heading/);
  });

  it("keeps heading attributes inert when the source contains quote payloads", () => {
    const rendered = renderMarkdown('# title" onmouseover="alert(1)');
    expect(rendered).toContain('<h1 id="title-onmouseoveralert1">');
    expect(rendered).not.toContain('id="title" onmouseover');
    expect(rendered).toContain('title" onmouseover="alert(1)');
    expect(escapeHtmlAttribute('" onmouseover="alert(1)')).toBe(
      "&quot; onmouseover=&quot;alert(1)",
    );
  });

  it("reads documents and includes without a stat/read time-of-check window", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "docs-ingestion-race-test-"));
    const stat = vi.spyOn(fs, "statSync");
    try {
      fs.writeFileSync(path.join(root, "index.md"), "# Root\n\n{{ include leaf.md }}\n", "utf8");
      fs.writeFileSync(path.join(root, "leaf.md"), "Leaf\n", "utf8");
      const files = readLocalSourceFromRoot(
        {
          id: "fixture",
          kind: "fixture",
          project: "fixture",
          title: "Fixture",
          root,
          versions: [{ id: "next", label: "Next", status: "draft", ref: "fixture" }],
        },
        { id: "next", label: "Next", status: "draft", ref: "fixture" },
        root,
      );
      expect(files[0].raw).toContain("Leaf");
      expect(resolveIncludes("<!-- include: leaf.md -->", path.join(root, "index.md"), root)).toBe(
        "Leaf\n",
      );
      expect(stat).not.toHaveBeenCalled();
    } finally {
      stat.mockRestore();
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("enforces the document-size limit while reading through the open handle", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "docs-ingestion-size-test-"));
    try {
      fs.writeFileSync(path.join(root, "index.md"), Buffer.alloc(256 * 1024 + 1, 120));
      expect(() =>
        readLocalSourceFromRoot(
          {
            id: "fixture",
            kind: "fixture",
            project: "fixture",
            title: "Fixture",
            root,
            versions: [{ id: "next", label: "Next", status: "draft", ref: "fixture" }],
          },
          { id: "next", label: "Next", status: "draft", ref: "fixture" },
          root,
        ),
      ).toThrow(/Document exceeds 262144 bytes/);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("keeps include expansion limits fail-closed", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "docs-ingestion-include-security-"));
    try {
      fs.writeFileSync(path.join(root, "leaf.md"), "leaf\n", "utf8");
      const input = Array.from({ length: 129 }, () => "{{ include leaf.md }}").join("\n");
      expect(() => resolveIncludes(input, path.join(root, "index.md"), root)).toThrow(
        /Include count exceeds 128/,
      );
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
