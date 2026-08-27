import { describe, expect, it } from "vitest";
import { designSystem, primitives, semanticTokens } from "../packages/design-system/src";

describe("Paper & Slate design system", () => {
  it("owns semantic theme and typography metadata", () => {
    expect(designSystem.status).toBe("source-owned");
    expect(designSystem.themes).toEqual(["light", "dark"]);
    expect(designSystem.typography).toEqual({
      display: "Bodoni Moda",
      interface: "Inter",
      code: "IBM Plex Mono",
    });
  });

  it("exposes the foundational token and primitive inventory", () => {
    expect(semanticTokens).toContain("focus-ring");
    expect(semanticTokens).toContain("experimental");
    expect(primitives).toEqual(expect.arrayContaining(["Container", "Surface", "SkipLink"]));
  });
});
