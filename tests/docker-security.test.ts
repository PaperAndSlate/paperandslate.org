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
});
