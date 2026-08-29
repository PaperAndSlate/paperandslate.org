import fs from "node:fs";
import { describe, expect, it } from "vitest";

describe("Docker context security policy", () => {
  it("excludes environment files and credential material from COPY . .", () => {
    const rules = fs.readFileSync(".dockerignore", "utf8").split(/\r?\n/);
    for (const rule of [
      ".env",
      ".env.*",
      "!.env.example",
      "**/*.pem",
      "**/*.key",
      "**/*.p12",
      "**/*.pfx",
      "**/*secret*",
      "**/*credential*",
      "**/*credentials*",
    ])
      expect(rules).toContain(rule);
  });

  it("copies the tracked pnpm patch before the dependency install layer", () => {
    const dockerfile = fs.readFileSync("infrastructure/docker/Dockerfile", "utf8");
    const patchCopy = dockerfile.indexOf(
      "COPY patches/extract-zip@2.0.1.patch patches/extract-zip@2.0.1.patch",
    );
    const install = dockerfile.indexOf("RUN pnpm install --frozen-lockfile");
    expect(patchCopy).toBeGreaterThanOrEqual(0);
    expect(install).toBeGreaterThan(patchCopy);
  });
});
