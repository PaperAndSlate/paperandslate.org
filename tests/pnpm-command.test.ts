import { describe, expect, it } from "vitest";
import { pnpmSpawnSpec } from "../scripts/pnpm-command";

describe("pnpmSpawnSpec", () => {
  it("uses pnpm directly with argv on POSIX platforms", () => {
    expect(pnpmSpawnSpec(["verify", "--changed", "path with spaces"], "linux")).toEqual({
      command: "pnpm",
      args: ["verify", "--changed", "path with spaces"],
    });
  });

  it("dispatches pnpm.cmd through an explicit Windows command interpreter", () => {
    expect(
      pnpmSpawnSpec(
        ["exec", "tsx", "scripts/example.ts"],
        "win32",
        "C:\\Windows\\System32\\cmd.exe",
      ),
    ).toEqual({
      command: "C:\\Windows\\System32\\cmd.exe",
      args: ["/d", "/s", "/c", "pnpm.cmd", "exec", "tsx", "scripts/example.ts"],
    });
  });

  it("does not interpolate arguments into a shell command string", () => {
    const invocation = pnpmSpawnSpec(["run", "task;whoami", "$(whoami)"], "win32");
    expect(invocation.args).not.toContain("run task;whoami $(whoami)");
    expect(invocation.args.slice(4)).toEqual(["run", "task;whoami", "$(whoami)"]);
  });
});
