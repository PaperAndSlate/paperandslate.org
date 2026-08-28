export type PnpmSpawnSpec = {
  command: string;
  args: string[];
};

/**
 * Return an explicit, shell-free invocation for pnpm on every supported host.
 *
 * Windows requires cmd.exe to dispatch the pnpm.cmd shim. Keeping the command
 * and argv separate avoids the deprecated child_process shell-array behavior
 * and prevents user-controlled task text from becoming a shell command.
 */
export function pnpmSpawnSpec(
  args: readonly string[],
  platform: NodeJS.Platform = process.platform,
  comspec = process.env.ComSpec || "cmd.exe",
): PnpmSpawnSpec {
  if (platform === "win32")
    return {
      command: comspec,
      args: ["/d", "/s", "/c", "pnpm.cmd", ...args],
    };
  return { command: "pnpm", args: [...args] };
}
