import { describe, expect, it } from "vitest";
import { porcelainPaths } from "../scripts/traceability-check";

describe("traceability Git status collection", () => {
  it("retains every path from a large status payload", () => {
    const entries = Array.from(
      { length: 120_000 },
      (_, index) => `?? generated/untracked-${index.toString().padStart(6, "0")}.txt`,
    );
    const paths = porcelainPaths(`${entries.join("\n")}\n`);

    expect(paths).toHaveLength(entries.length);
    expect(paths[0]).toBe("generated/untracked-000000.txt");
    expect(paths.at(-1)).toBe("generated/untracked-119999.txt");
  });
});
