import { describe, expect, it } from "vitest";
import {
  collectAssets,
  collectSource,
  loadRegistry,
  readFixtureSource,
  resolvedGitSha,
} from "../packages/docs-ingestion/src";

describe("documentation source adapters", () => {
  it("dispatches fixture content without a network adapter", () => {
    const source = loadRegistry().find((item) => item.id === "file-system");
    expect(source).toBeDefined();
    const version = source!.versions.find((item) => item.id === "next")!;
    const files = readFixtureSource(source!, version);
    expect(files.some((file) => file.relativePath === "index.md")).toBe(true);
    const first = collectSource(source!, version);
    expect(first.lock.lockType).toBe("content-hash");
    expect(first.lock.deterministicId).toMatch(/^[a-f0-9]{64}$/);
  });

  it("keeps historical routes canonical and distinct", () => {
    const source = loadRegistry().find((item) => item.id === "file-system")!;
    const historical = collectSource(
      source,
      source.versions.find((item) => item.id === "v1")!,
    ).documents.find((doc) => doc.sourcePath === "index.md")!;
    expect(historical.canonicalRoute).toBe("/docs/file-system/v/1.0");
    expect(historical.aliases).toContain("/docs/file-system/v1");
  });

  it("rejects unapproved or unresolved Git sources", () => {
    const source = {
      id: "git",
      kind: "git" as const,
      project: "git",
      title: "Git",
      root: ".",
      versions: [{ id: "next", label: "Next", status: "draft" as const, ref: "head" }],
    };
    expect(() => resolvedGitSha(source, source.versions[0])).toThrow(/approved/);
  });

  it("uses a safe, deterministic asset inventory", () => {
    expect(collectAssets("tests/fixtures/docs-source/projects/file-system")).toEqual([]);
  });
});
