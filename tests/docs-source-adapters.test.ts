import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  collectAssets,
  collectSource,
  generateBundle,
  loadRegistry,
  readGitSource,
  readFixtureSource,
  resolvedGitSha,
  writeBundle,
} from "../packages/docs-ingestion/src";
import { checkDocsSourceBinding } from "../scripts/docs-source-binding";

function runGit(args: string[], cwd: string): void {
  execFileSync("git", ["-C", cwd, ...args], { stdio: "ignore" });
}

function readGitOutput(args: string[], cwd: string): string {
  return execFileSync("git", ["-C", cwd, ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
}

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

  it("reads Git documentation from the pinned commit instead of the worktree", () => {
    const repository = fs.mkdtempSync(path.join(os.tmpdir(), "eom-git-source-test-"));
    try {
      fs.mkdirSync(path.join(repository, "docs"), { recursive: true });
      fs.writeFileSync(
        path.join(repository, "docs", "index.md"),
        "---\ntitle: Committed\n---\nCommitted content\n",
      );
      runGit(["init"], repository);
      runGit(["config", "user.email", "tests@example.invalid"], repository);
      runGit(["config", "user.name", "EOM tests"], repository);
      runGit(["add", "docs/index.md"], repository);
      runGit(["commit", "-m", "initial docs"], repository);
      const sha = readGitOutput(["rev-parse", "HEAD"], repository);
      fs.writeFileSync(
        path.join(repository, "docs", "index.md"),
        "---\ntitle: Worktree\n---\nUnreviewed worktree content\n",
      );
      const source = {
        id: "git",
        kind: "git" as const,
        project: "git",
        title: "Git",
        root: repository,
        approved: true,
        versions: [
          {
            id: "next",
            label: "Next",
            status: "draft" as const,
            ref: "pinned",
            docs: "docs",
            gitSha: sha,
          },
        ],
      };

      const files = readGitSource(source, source.versions[0]);
      expect(files).toHaveLength(1);
      expect(files[0].file).toBe(path.join(repository, "docs", "index.md"));
      expect(files[0].raw).toContain("Committed content");
      expect(files[0].raw).not.toContain("Unreviewed worktree content");
    } finally {
      fs.rmSync(repository, { recursive: true, force: true });
    }
  });

  it("uses a safe, deterministic asset inventory", () => {
    expect(collectAssets("tests/fixtures/docs-source/projects/file-system")).toEqual([]);
  });

  it("rejects generated documents that are not represented by the source lock", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "eom-source-binding-test-"));
    try {
      const source = {
        id: "fixture",
        kind: "fixture" as const,
        project: "fixture",
        title: "Fixture",
        root: "docs",
        versions: [{ id: "next", label: "Next", status: "draft" as const, ref: "fixture-next" }],
      };
      fs.mkdirSync(path.join(root, "docs"), { recursive: true });
      fs.writeFileSync(
        path.join(root, "docs", "index.md"),
        "---\ntitle: Fixture\n---\nFixture content\n",
      );
      fs.mkdirSync(path.join(root, "config"), { recursive: true });
      fs.writeFileSync(
        path.join(root, "config", "docs-sources.yml"),
        JSON.stringify({ sources: [source] }),
      );
      const collected = collectSource(source, source.versions[0], root);
      writeBundle(
        generateBundle(collected.documents, [collected.lock]),
        path.join(root, ".generated", "docs"),
      );
      const generated = JSON.parse(
        fs.readFileSync(path.join(root, ".generated", "docs", "documents.json"), "utf8"),
      ) as unknown[];
      const firstDocument = generated[0] as Record<string, unknown>;
      generated.push({ ...firstDocument, id: "fixture:next:extra", sourcePath: "extra.md" });
      fs.writeFileSync(
        path.join(root, ".generated", "docs", "documents.json"),
        `${JSON.stringify(generated, null, 2)}\n`,
      );
      expect(checkDocsSourceBinding(root).mismatches.join("\n")).toMatch(
        /not present in the source lock|source lock file has no generated document/,
      );
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("rejects generated documents that use an unregistered source revision", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "eom-source-binding-test-"));
    try {
      const source = {
        id: "fixture",
        kind: "fixture" as const,
        project: "fixture",
        title: "Fixture",
        root: "docs",
        versions: [{ id: "next", label: "Next", status: "draft" as const, ref: "fixture-next" }],
      };
      fs.mkdirSync(path.join(root, "docs"), { recursive: true });
      fs.writeFileSync(path.join(root, "docs", "index.md"), "---\ntitle: Fixture\n---\nFixture\n");
      fs.mkdirSync(path.join(root, "config"), { recursive: true });
      fs.writeFileSync(
        path.join(root, "config", "docs-sources.yml"),
        JSON.stringify({ sources: [source] }),
      );
      const collected = collectSource(source, source.versions[0], root);
      writeBundle(
        generateBundle(collected.documents, [collected.lock]),
        path.join(root, ".generated", "docs"),
      );
      const generated = JSON.parse(
        fs.readFileSync(path.join(root, ".generated", "docs", "documents.json"), "utf8"),
      ) as Array<Record<string, unknown>>;
      generated[0].ref = "unregistered-ref";
      fs.writeFileSync(
        path.join(root, ".generated", "docs", "documents.json"),
        `${JSON.stringify(generated, null, 2)}\n`,
      );
      expect(checkDocsSourceBinding(root).mismatches.join("\n")).toMatch(
        /unregistered source\/ref binding/,
      );
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
