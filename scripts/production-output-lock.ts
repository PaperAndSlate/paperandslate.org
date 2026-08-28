import path from "node:path";
import { fileURLToPath } from "node:url";
import { acquireExclusiveRunLock } from "./exclusive-run-lock";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const lockPath = path.join(repositoryRoot, ".generated", "launch", "production-output.lock");

export async function withProductionOutputLock<T>(run: () => Promise<T>) {
  const release = await acquireExclusiveRunLock(lockPath);
  try {
    return await run();
  } finally {
    await release();
  }
}
