import path from "node:path";
import { acquireExclusiveRunLock } from "./exclusive-run-lock";

const lockPath = path.join(process.cwd(), ".generated", "launch", "production-output.lock");

export async function withProductionOutputLock<T>(run: () => Promise<T>) {
  const release = await acquireExclusiveRunLock(lockPath);
  try {
    return await run();
  } finally {
    await release();
  }
}
