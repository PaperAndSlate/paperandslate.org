import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ensureStandaloneOutput } from "../scripts/standalone-output";

describe("standalone output preparation", () => {
  it("does not rebuild an existing standalone server", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "eom-standalone-"));
    const serverPath = path.join(directory, "server.js");
    await writeFile(serverPath, "// existing\n", "utf8");
    let buildCount = 0;

    try {
      await ensureStandaloneOutput(serverPath, async () => {
        buildCount += 1;
      });
      expect(buildCount).toBe(0);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it("builds once when the standalone server is missing", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "eom-standalone-"));
    const serverPath = path.join(directory, "server.js");
    let buildCount = 0;

    try {
      await ensureStandaloneOutput(serverPath, async () => {
        buildCount += 1;
        await writeFile(serverPath, "// generated\n", "utf8");
      });
      expect(buildCount).toBe(1);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});
