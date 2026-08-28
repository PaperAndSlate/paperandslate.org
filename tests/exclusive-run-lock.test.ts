import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  acquireExclusiveRunLock,
  ExclusiveRunAlreadyActiveError,
} from "../scripts/exclusive-run-lock";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  const { rm } = await import("node:fs/promises");
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

describe("acquireExclusiveRunLock", () => {
  it("refuses concurrent ownership and releases cleanly", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "paper-slate-lock-"));
    temporaryDirectories.push(directory);
    const lockPath = path.join(directory, "run.lock");
    const release = await acquireExclusiveRunLock(lockPath);

    await expect(acquireExclusiveRunLock(lockPath)).rejects.toMatchObject({
      name: "ExclusiveRunAlreadyActiveError",
    } satisfies Partial<ExclusiveRunAlreadyActiveError>);

    await release();
    const releaseAfterOwner = await acquireExclusiveRunLock(lockPath);
    await releaseAfterOwner();
  });

  it("recovers a lock left by a process that is no longer alive", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "paper-slate-lock-"));
    temporaryDirectories.push(directory);
    const lockPath = path.join(directory, "run.lock");
    await writeFile(
      lockPath,
      `${JSON.stringify({ pid: 2_147_483_647, startedAt: new Date().toISOString() })}\n`,
      "utf8",
    );

    const release = await acquireExclusiveRunLock(lockPath);
    await expect(readFile(lockPath, "utf8")).resolves.toContain(`"pid":${process.pid}`);
    await release();
  });
});
