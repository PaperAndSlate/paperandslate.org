import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { copyEvidenceTree } from "../scripts/evidence-files";

describe("evidence filesystem boundaries", () => {
  it("copies regular evidence files within the bundle", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "eom-evidence-copy-test-"));
    const source = path.join(root, "source");
    const bundle = path.join(root, "bundle");
    try {
      fs.mkdirSync(source, { recursive: true });
      fs.writeFileSync(path.join(source, "report.json"), "{}\n");
      copyEvidenceTree(source, path.join(bundle, "reports"), root, bundle);
      expect(fs.readFileSync(path.join(bundle, "reports", "report.json"), "utf8")).toBe("{}\n");
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("rejects a symlinked evidence entry", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "eom-evidence-link-test-"));
    const source = path.join(root, "source");
    const bundle = path.join(root, "bundle");
    try {
      fs.mkdirSync(source, { recursive: true });
      const outside = path.join(root, "outside.txt");
      const link = path.join(source, "outside.txt");
      fs.writeFileSync(outside, "outside\n");
      try {
        fs.symlinkSync(outside, link, "file");
      } catch (error) {
        const code = (error as NodeJS.ErrnoException).code;
        if (process.platform === "win32" && (code === "EPERM" || code === "EACCES")) return;
        throw error;
      }
      expect(() => copyEvidenceTree(source, path.join(bundle, "reports"), root, bundle)).toThrow(
        /Refusing symlink/,
      );
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
