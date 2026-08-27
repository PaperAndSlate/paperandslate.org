import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { lstat, readdir, readFile, realpath, rm } from "node:fs/promises";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const webRoot = resolve(root, "apps", "web");
const outputRoot = resolve(webRoot, ".next");
const sourceRoot = resolve(webRoot, "src");
const configFile = resolve(webRoot, "next.config.ts");
const dockerfile = resolve(root, "infrastructure", "docker", "Dockerfile");

const fail = (message: string): never => {
  throw new Error(`[build:verify] ${message}`);
};

const assertExactOutputRoot = () => {
  const expected = resolve(webRoot, ".next");
  if (outputRoot !== expected || !outputRoot.startsWith(`${webRoot}${sep}`)) {
    fail(`refusing to clean unexpected output path: ${outputRoot}`);
  }
};

const removeOutputSafely = async () => {
  assertExactOutputRoot();
  let rootStats;
  try {
    rootStats = await lstat(outputRoot);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
    throw error;
  }
  if (rootStats.isSymbolicLink()) {
    fail("apps/web/.next is a reparse point; refusing cleanup");
  }

  for (const entry of await readdir(outputRoot, { withFileTypes: true })) {
    const child = join(outputRoot, entry.name);
    const childStats = await lstat(child);
    if (childStats.isSymbolicLink()) {
      await rm(child, { force: true });
    } else {
      await rm(child, { recursive: true, force: true });
    }
  }
  await rm(outputRoot, { recursive: true, force: true });
};

const digestPath = async (target: string): Promise<string> => {
  const stats = await lstat(target);
  if (stats.isSymbolicLink()) fail(`source hash target is a reparse point: ${target}`);
  if (stats.isDirectory()) {
    const entries = (await readdir(target, { withFileTypes: true })).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    const hash = createHash("sha256");
    for (const entry of entries) {
      hash.update(entry.name);
      hash.update(await digestPath(join(target, entry.name)));
    }
    return hash.digest("hex");
  }
  return createHash("sha256")
    .update(await readFile(target))
    .digest("hex");
};

const snapshot = async () =>
  Promise.all(
    [sourceRoot, configFile, dockerfile].map(
      async (target) => [target, await digestPath(target)] as const,
    ),
  );

const assertStable = async (before: readonly (readonly [string, string])[]) => {
  const after = await snapshot();
  for (let index = 0; index < before.length; index += 1) {
    if (before[index][1] !== after[index][1]) {
      fail(`source/configuration/Dockerfile changed during verification: ${before[index][0]}`);
    }
  }
};

const assertCleanOutput = async () => {
  const visit = async (target: string) => {
    const stats = await lstat(target);
    if (stats.isSymbolicLink()) fail(`verification output contains a reparse point: ${target}`);
    if (!stats.isDirectory()) return;
    for (const entry of await readdir(target, { withFileTypes: true })) {
      if (entry.name === "standalone" || entry.name === ".turbo" || entry.name === "test-results") {
        fail(`verification output contains forbidden tree: ${join(target, entry.name)}`);
      }
      await visit(join(target, entry.name));
    }
  };
  await visit(outputRoot);
};

const run = async () => {
  await removeOutputSafely();
  const before = await snapshot();
  const nextCli = await realpath(resolve(webRoot, "node_modules", "next", "dist", "bin", "next"));
  const result = spawnSync(process.execPath, [nextCli, "build"], {
    cwd: webRoot,
    env: { ...process.env, NODE_ENV: "production", PAPER_SLATE_BUILD_MODE: "verification" },
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status === null) fail("Next.js production build did not return an exit status");
  if (result.status !== 0) process.exit(result.status);
  await assertStable(before);
  await assertCleanOutput();
  process.stdout.write("[build:verify] verified non-standalone production output\n");
};

run().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? (error.stack ?? error.message) : String(error)}\n`,
  );
  process.exit(1);
});
