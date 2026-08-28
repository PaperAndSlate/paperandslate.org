import { access } from "node:fs/promises";
import { isMissingPathError } from "./fs-errors";

export async function ensureStandaloneOutput(serverPath: string, build: () => Promise<void>) {
  try {
    await access(serverPath);
  } catch (error) {
    if (!isMissingPathError(error)) throw error;
    await build();
    await access(serverPath);
  }
}
