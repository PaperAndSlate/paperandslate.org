import { mkdir, open, readFile, rm, type FileHandle } from "node:fs/promises";
import path from "node:path";

export class ExclusiveRunAlreadyActiveError extends Error {
  constructor(lockPath: string, holder: string | null) {
    const detail = holder ? ` Holder: ${holder}` : "";
    super(`Another run already owns ${lockPath}.${detail}`);
    this.name = "ExclusiveRunAlreadyActiveError";
  }
}

function processIsAlive(pid: number) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === "EPERM";
  }
}

function staleOwner(holder: string | null) {
  if (!holder) return false;
  try {
    const parsed = JSON.parse(holder) as { pid?: unknown };
    return (
      typeof parsed.pid === "number" &&
      Number.isInteger(parsed.pid) &&
      parsed.pid > 0 &&
      !processIsAlive(parsed.pid)
    );
  } catch {
    return false;
  }
}

export async function acquireExclusiveRunLock(lockPath: string): Promise<() => Promise<void>> {
  await mkdir(path.dirname(lockPath), { recursive: true });
  while (true) {
    let handle: FileHandle | undefined;
    try {
      handle = await open(lockPath, "wx");
      await handle.writeFile(
        `${JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() })}\n`,
        "utf8",
      );
    } catch (error) {
      if (handle) {
        await handle.close().catch(() => undefined);
        await rm(lockPath, { force: true }).catch(() => undefined);
      }
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      let holder: string | null = null;
      try {
        holder = (await readFile(lockPath, "utf8")).trim() || null;
      } catch {
        // The owner may have released the lock between open and readFile.
      }
      if (staleOwner(holder)) {
        await rm(lockPath, { force: true });
        continue;
      }
      throw new ExclusiveRunAlreadyActiveError(lockPath, holder);
    }

    let released = false;
    return async () => {
      if (released) return;
      released = true;
      await handle?.close();
      await rm(lockPath, { force: true });
    };
  }
}
