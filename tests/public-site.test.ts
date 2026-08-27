import { describe, expect, it } from "vitest";
import { foundationPages, getProject, projects } from "../packages/content/src/index";

describe("public content registry", () => {
  it("contains unique, truthful project entries", () => {
    expect(new Set(projects.map((project) => project.slug)).size).toBe(projects.length);
    expect(
      projects.every((project) => ["planned", "unreleased", "available"].includes(project.status)),
    ).toBe(true);
    expect(getProject("file-system")?.status).toBe("planned");
  });

  it("covers the foundation navigation", () => {
    expect(foundationPages.map((page) => page.slug)).toEqual([
      "mission",
      "principles",
      "people",
      "funding",
      "roadmap",
      "reports",
      "contact",
    ]);
  });
});
