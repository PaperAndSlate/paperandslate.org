import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { preparePnpmEnv, spawnPnpmSync } from "./pnpm-command";
import { sourceDirtyPaths, sourceWorktreeClean } from "./source-state";

const root = process.cwd();
const packageRoot = path.join(root, "packages");
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "paper-and-slate-package-smoke-"));
const archiveRoot = path.join(tempRoot, "archives");
const consumerRoot = path.join(tempRoot, "consumer");
const consumerSource = path.join(consumerRoot, "consumer.ts");
const evidencePath = path.join(root, ".generated", "launch", "package-smoke.json");

export function run(
  args: string[],
  cwd: string,
  spawnSyncImpl: typeof spawnPnpmSync = spawnPnpmSync,
) {
  const result = spawnSyncImpl(args, {
    cwd,
    env: preparePnpmEnv({ ...process.env, CI: "true" }),
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });
  const stdout =
    typeof result.stdout === "string" ? result.stdout : (result.stdout?.toString() ?? "");
  const stderr =
    typeof result.stderr === "string" ? result.stderr : (result.stderr?.toString() ?? "");
  if (result.error || result.status !== 0)
    throw new Error(
      `pnpm ${args.join(" ")} failed in ${cwd}: ${result.error?.message ?? (stderr.trim() || stdout.trim())}`,
    );
  return stdout;
}

function sha256(file: string) {
  return createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function packageDirectories() {
  return fs
    .readdirSync(packageRoot, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() && fs.existsSync(path.join(packageRoot, entry.name, "package.json")),
    )
    .map((entry) => path.join(packageRoot, entry.name))
    .sort((a, b) => a.localeCompare(b));
}

function pack(directory: string) {
  const before = new Set(fs.readdirSync(archiveRoot));
  run(["pack", "--pack-destination", archiveRoot], directory);
  const archive = fs
    .readdirSync(archiveRoot)
    .filter((entry) => !before.has(entry) && entry.endsWith(".tgz"))
    .map((entry) => path.join(archiveRoot, entry));
  if (archive.length !== 1) throw new Error(`Expected one package archive for ${directory}`);
  return archive[0];
}

type PackedPackage = { name: string; archive: string };

function writeConsumer(packages: PackedPackage[]) {
  fs.mkdirSync(consumerRoot, { recursive: true });
  fs.writeFileSync(
    path.join(consumerRoot, "package.json"),
    `${JSON.stringify({ name: "paper-and-slate-package-consumer", private: true, type: "module" }, null, 2)}\n`,
  );
  const overrides = packages
    .map(({ name, archive }) => `  ${JSON.stringify(name)}: ${JSON.stringify(`file:${archive}`)}`)
    .join("\n");
  fs.writeFileSync(
    path.join(consumerRoot, "pnpm-workspace.yaml"),
    `onlyBuiltDependencies:\n  - esbuild\noverrides:\n${overrides}\n`,
  );
  fs.writeFileSync(
    consumerSource,
    `import { parseEnv } from "@paper-and-slate/config";
import { publicProjects } from "@paper-and-slate/content";
import { designSystem } from "@paper-and-slate/design-system";
import { parseFrontmatter } from "@paper-and-slate/docs-ingestion";
import { normalizeRecords } from "@paper-and-slate/search";
import type { Project } from "@paper-and-slate/content";

const project: Project | undefined = publicProjects[0];
if (!project || !designSystem.name || !parseEnv({ NEXT_PUBLIC_SITE_URL: "https://example.test" }).NEXT_PUBLIC_SITE_URL)
  throw new Error("package consumer imports did not expose expected values");
if (!parseFrontmatter("---\\ntitle: Smoke\\n---\\nBody").data.title)
  throw new Error("documentation package did not parse frontmatter");
if (normalizeRecords([{ id: "smoke", title: "Smoke", summary: "Smoke", text: "Smoke", route: "/", type: "project", source: "content" }]).length !== 1)
  throw new Error("search package did not normalize a record");
console.log(project.name);
`,
  );
}

function main() {
  try {
    fs.mkdirSync(archiveRoot, { recursive: true });
    const packages = packageDirectories().map((directory) => ({
      name: JSON.parse(fs.readFileSync(path.join(directory, "package.json"), "utf8"))
        .name as string,
      archive: pack(directory),
    }));
    writeConsumer(packages);
    run(
      [
        "add",
        "--save-exact",
        "--save-dev",
        "tsx@4.19.3",
        "typescript@5.8.2",
        ...packages.map(({ archive }) => archive),
      ],
      consumerRoot,
    );
    run(
      [
        "exec",
        "tsc",
        "--noEmit",
        "--module",
        "ESNext",
        "--moduleResolution",
        "Bundler",
        "--target",
        "ES2022",
        "--jsx",
        "react-jsx",
        "--skipLibCheck",
        "consumer.ts",
      ],
      consumerRoot,
    );
    run(["exec", "tsx", "consumer.ts"], consumerRoot);
    fs.mkdirSync(path.dirname(evidencePath), { recursive: true });
    const status = sourceStatus();
    fs.writeFileSync(
      evidencePath,
      `${JSON.stringify(
        {
          schemaVersion: 1,
          status: "passed",
          generatedAt: new Date().toISOString(),
          source: {
            commit: runGit(["rev-parse", "HEAD"]),
            tree: runGit(["rev-parse", "HEAD^{tree}"]),
            worktreeClean: sourceWorktreeClean(status),
            dirtyPaths: sourceDirtyPaths(status),
          },
          packages: packages.map(({ archive }) => ({
            archive: path.basename(archive),
            sha256: sha256(archive),
          })),
          consumer: {
            typecheck: "passed",
            runtimeImports: "passed",
            installationRoot: "external temporary directory",
          },
        },
        null,
        2,
      )}\n`,
    );
    console.log(
      `Clean package consumer smoke passed for ${packages.length} workspace packages: ${packages
        .map(({ archive }) => `${path.basename(archive)}:${sha256(archive).slice(0, 12)}`)
        .join(", ")}`,
    );
  } catch (error) {
    fs.mkdirSync(path.dirname(evidencePath), { recursive: true });
    const message = error instanceof Error ? error.message : String(error);
    const status = sourceStatus();
    fs.writeFileSync(
      evidencePath,
      `${JSON.stringify(
        {
          schemaVersion: 1,
          status: "failed",
          generatedAt: new Date().toISOString(),
          source: {
            commit: runGit(["rev-parse", "HEAD"]),
            tree: runGit(["rev-parse", "HEAD^{tree}"]),
            worktreeClean: sourceWorktreeClean(status),
            dirtyPaths: sourceDirtyPaths(status),
          },
          error: message,
        },
        null,
        2,
      )}\n`,
    );
    throw error;
  } finally {
    if (process.env.PACKAGE_SMOKE_KEEP_TEMP !== "true")
      fs.rmSync(tempRoot, { recursive: true, force: true });
    else console.log(`Package smoke temporary files retained at ${tempRoot}`);
  }
}

function runGit(args: string[]) {
  const result = spawnSync("git", args, { cwd: root, encoding: "utf8", windowsHide: true });
  if (result.error || result.status !== 0)
    throw new Error(
      `git ${args.join(" ")} failed: ${result.error?.message ?? result.stderr.trim()}`,
    );
  return result.stdout.trim();
}

function sourceStatus() {
  const result = spawnSync("git", ["status", "--porcelain", "--untracked-files=all"], {
    cwd: root,
    encoding: "utf8",
    windowsHide: true,
  });
  if (result.error || result.status !== 0)
    throw new Error(`git status failed: ${result.error?.message ?? result.stderr.trim()}`);
  return result.stdout.trimEnd();
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
