import fs from "node:fs";
import { EventEmitter } from "node:events";
import { spawnPnpm, spawnPnpmSync } from "../scripts/pnpm-command";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";

// Import the command wrappers through their real module boundaries. Each
// wrapper uses invocation identity, not a caller-controlled environment flag,
// to keep its production entrypoint from running during this test import.
const [
  buildWeb,
  ciBrowser,
  lighthouseStaging,
  lighthouse,
  packageSmoke,
  reproducibility,
  verify,
  vulnerability,
  wrapperFailure,
] = await Promise.all([
  import("../scripts/build-web"),
  import("../scripts/ci-browser"),
  import("../scripts/lighthouse-staging"),
  import("../scripts/lighthouse"),
  import("../scripts/package-smoke"),
  import("../scripts/reproducibility-check"),
  import("../scripts/verify"),
  import("../scripts/vulnerability-scan"),
  import("../scripts/wrapper-failure-fixture"),
]);

const callerFiles = [
  "scripts/build-web.ts",
  "scripts/ci-browser.ts",
  "scripts/lighthouse-staging.ts",
  "scripts/lighthouse.ts",
  "scripts/package-smoke.ts",
  "scripts/reproducibility-check.ts",
  "scripts/verify.ts",
  "scripts/vulnerability-scan.ts",
  "scripts/wrapper-failure-fixture.ts",
];
const fixture = path.join(process.cwd(), "tests", "fixtures", "pnpm-argv-probe.cjs");
const callerControlledImportGuard = ["PAPER", "SLATE", "TEST", "IMPORT"].join("_");

describe("ci-browser launch boundary", () => {
  it("accepts only the fixed verify and lighthouse repository scripts", () => {
    expect(ciBrowser.parseBrowserScriptArgs(["verify"])).toBe("verify");
    expect(ciBrowser.parseBrowserScriptArgs(["lighthouse"])).toBe("lighthouse");
  });

  it.each([[[]], [["--help"]], [["verify", "--unsafe"]], [["unknown"]], [["lighthouse", "extra"]]])(
    "rejects invalid browser arguments before side effects: %j",
    (args) => {
      expect(() => ciBrowser.parseBrowserScriptArgs(args)).toThrow(/Usage/);
    },
  );
});

describe("pnpm wrapper migration", () => {
  it("routes every first-party pnpm caller through the shared safe adapter", () => {
    for (const relative of callerFiles) {
      const source = fs.readFileSync(path.join(process.cwd(), relative), "utf8");
      expect(source).toContain(relative === "scripts/ci-browser.ts" ? "spawnPnpm" : "spawnPnpm");
      expect(source).not.toContain(callerControlledImportGuard);
      expect(source).toContain("fileURLToPath(import.meta.url)");
      expect(source).toMatch(/path\.resolve\(process\.argv\[1\]\)/);
      expect(source).not.toContain("pnpmSpawnSpec(");
      expect(source).not.toMatch(/spawn(?:Sync)?\(invocation\.command/);
    }
  });

  it("preserves synchronous and asynchronous child failure statuses", async () => {
    const sync = spawnPnpmSync(["exec", process.execPath, fixture, "--exit", "17"], {
      cwd: process.cwd(),
      stdio: "ignore",
    });
    expect(sync.error).toBeUndefined();
    expect(sync.status).toBe(17);

    const child = spawnPnpm(["exec", process.execPath, fixture, "--exit", "19"], {
      cwd: process.cwd(),
      stdio: "ignore",
    });
    const result = await new Promise<{ code: number | null; signal: NodeJS.Signals | null }>(
      (resolve, reject) => {
        child.once("error", reject);
        child.once("exit", (code, signal) => resolve({ code, signal }));
      },
    );
    expect(result).toEqual({ code: 19, signal: null });
  });

  it("propagates spawn errors, null/signal exits, and verifies timeout cleanup", async () => {
    const spawnError = new Error("synthetic spawn error");
    const throwingSpawn = vi.fn(() => {
      throw spawnError;
    }) as unknown as typeof spawnPnpm;
    await expect(verify.runTask("spawn-error", throwingSpawn)).rejects.toBe(spawnError);

    const emitExit = (code: number | null, signal: NodeJS.Signals | null) => {
      const child = new EventEmitter() as ReturnType<typeof spawnPnpm>;
      Object.assign(child, { kill: vi.fn(() => true) });
      queueMicrotask(() => child.emit("exit", code, signal));
      return child;
    };
    const errorChild = new EventEmitter() as ReturnType<typeof spawnPnpm>;
    Object.assign(errorChild, { kill: vi.fn(() => true) });
    const errorSpawn = vi.fn(() => {
      queueMicrotask(() => errorChild.emit("error", spawnError));
      return errorChild;
    }) as unknown as typeof spawnPnpm;
    await expect(verify.runTask("async-error", errorSpawn)).rejects.toBe(spawnError);

    const nullExit = vi.fn(() => emitExit(null, null)) as unknown as typeof spawnPnpm;
    await expect(verify.runTask("null-exit", nullExit)).resolves.toBe(1);
    const signalExit = vi.fn(() => emitExit(null, "SIGTERM")) as unknown as typeof spawnPnpm;
    await expect(verify.runTask("signal-exit", signalExit)).rejects.toThrow(/SIGTERM/);

    const neverExit = new EventEmitter() as ReturnType<typeof spawnPnpm>;
    const kill = vi.fn(() => true);
    Object.assign(neverExit, { kill });
    const timeoutSpawn = vi.fn(() => neverExit) as unknown as typeof spawnPnpm;
    const stop = vi.fn((child: ReturnType<typeof spawnPnpm> | undefined) => {
      child?.kill();
    });
    await expect(verify.runTask("timeout", timeoutSpawn, stop, 10)).rejects.toThrow(
      /exceeded the 10ms task timeout/,
    );
    expect(stop).toHaveBeenCalledTimes(1);
    expect(kill).toHaveBeenCalledTimes(1);
    await new Promise((resolve) => setTimeout(resolve, 25));
    expect(stop).toHaveBeenCalledTimes(1);
  });

  it("exercises every migrated caller seam with its exact argv, cwd, and environment additions", async () => {
    type SyncResult = ReturnType<typeof spawnPnpmSync>;
    type AsyncChild = ReturnType<typeof spawnPnpm>;
    const syncCalls: Array<{
      args: readonly string[];
      options: Record<string, unknown> | undefined;
    }> = [];
    const asyncCalls: Array<{
      args: readonly string[];
      options: Record<string, unknown> | undefined;
    }> = [];
    const syncResult = (stdout = '{"advisories":{}}', status = 0): SyncResult =>
      ({
        pid: 123,
        output: [null, stdout, ""],
        stdout,
        stderr: "",
        status,
        signal: null,
      }) as SyncResult;
    const fakeSync = ((args: readonly string[], options: Record<string, unknown>) => {
      syncCalls.push({ args, options });
      return syncResult();
    }) as typeof spawnPnpmSync;
    const fakeAsync = ((args: readonly string[], options: Record<string, unknown>) => {
      asyncCalls.push({ args, options });
      const child = new EventEmitter() as AsyncChild;
      Object.assign(child, { kill: vi.fn(() => true) });
      queueMicrotask(() => child.emit("exit", 0, null));
      return child;
    }) as typeof spawnPnpm;

    buildWeb.runBuildWeb(fakeSync);
    packageSmoke.run(["--version"], path.join(process.cwd(), "consumer"), fakeSync);
    reproducibility.runSearch(fakeSync);
    vulnerability.runAudit(false, fakeSync);
    const failureSync = ((args: readonly string[], options: Record<string, unknown>) => {
      syncCalls.push({ args, options });
      return syncResult("", 17);
    }) as typeof spawnPnpmSync;
    wrapperFailure.expectFailure("scripts/example.ts", { FIXTURE: "true" }, failureSync);

    const browserPathBefore = process.env.PLAYWRIGHT_EXECUTABLE_PATH;
    const previousExitCode = process.exitCode;
    process.env.PLAYWRIGHT_EXECUTABLE_PATH = process.execPath;
    ciBrowser.main(["verify"], fakeAsync);
    await lighthouse.runLighthouse("lighthouse.json", { CI: "true", NODE_ENV: "test" }, fakeAsync);
    await lighthouseStaging.runLighthouse(
      "staging.json",
      { CI: "true", NODE_ENV: "test" },
      fakeAsync,
    );
    expect(await verify.runTask("test", fakeAsync)).toBe(0);
    process.exitCode = previousExitCode;
    if (browserPathBefore === undefined) delete process.env.PLAYWRIGHT_EXECUTABLE_PATH;
    else process.env.PLAYWRIGHT_EXECUTABLE_PATH = browserPathBefore;

    expect(syncCalls.map(({ args }) => [...args])).toEqual([
      ["--filter", "@paper-and-slate/web", "build"],
      ["--version"],
      ["search:index"],
      ["audit", "--json", "--audit-level=high"],
      ["exec", "tsx", "scripts/example.ts"],
    ]);
    expect(syncCalls[0].options?.cwd).toBe(process.cwd());
    expect(syncCalls[0].options).toMatchObject({ stdio: "inherit" });
    expect(syncCalls[1].options?.cwd).toContain("consumer");
    expect(syncCalls[1].options).toMatchObject({ encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });
    expect((syncCalls[1].options?.env as NodeJS.ProcessEnv).CI).toBe("true");
    expect(syncCalls[2].options).toMatchObject({
      cwd: process.cwd(),
      encoding: "utf8",
      maxBuffer: 20 * 1024 * 1024,
    });
    expect((syncCalls[2].options?.env as NodeJS.ProcessEnv).PUBLICATION_AS_OF).toBe("2026-08-27");
    expect((syncCalls[2].options?.env as NodeJS.ProcessEnv).TZ).toBe("UTC");
    expect(syncCalls[3].options).toMatchObject({
      cwd: process.cwd(),
      encoding: "utf8",
      maxBuffer: 20 * 1024 * 1024,
    });
    expect((syncCalls[4].options?.env as NodeJS.ProcessEnv).FIXTURE).toBe("true");
    expect(syncCalls[4].options).toMatchObject({
      cwd: process.cwd(),
      stdio: "pipe",
      encoding: "utf8",
    });

    expect(asyncCalls.map(({ args }) => [...args])).toEqual([
      ["verify"],
      ["exec", "lhci", "autorun", "--config=lighthouse.json"],
      ["exec", "lhci", "autorun", "--config=staging.json"],
      ["test"],
    ]);
    for (const call of asyncCalls) {
      expect(call.options).toMatchObject({ cwd: process.cwd(), stdio: "inherit" });
    }
    const browserEnv = asyncCalls[0].options?.env as NodeJS.ProcessEnv;
    expect(browserEnv.CI_BROWSER_UNPRIVILEGED).toBe("true");
    expect(browserEnv.PLAYWRIGHT_EXECUTABLE_PATH).toBe(process.execPath);
    expect(browserEnv.CHROME_PATH).toBe(process.execPath);
    for (const call of [...syncCalls, ...asyncCalls]) {
      const env = call.options?.env as NodeJS.ProcessEnv;
      expect(Object.keys(env)).not.toContain(callerControlledImportGuard);
      expect(Object.keys(env).map((key) => key.toLowerCase())).not.toContain(
        "npm_config_script_shell",
      );
      expect(Object.keys(env).map((key) => key.toLowerCase())).not.toContain("node_options");
    }
  });
});
