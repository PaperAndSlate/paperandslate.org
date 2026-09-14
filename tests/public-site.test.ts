import { describe, expect, it } from "vitest";
import {
  filterPublicProjects,
  foundationPages,
  getProject,
  people,
  projects,
  publicPeopleAt,
  publicProjectsAt,
} from "../packages/content/src/index";
import { GET as getProjectsJson } from "../apps/web/src/app/projects.json/route";

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

  it("keeps hidden records out of public projections", () => {
    expect(
      publicProjectsAt([
        projects[0]!,
        { ...projects[1]!, visibility: "hidden" },
        { ...projects[2]!, visibility: "preview" },
      ]).map((project) => project.slug),
    ).toEqual([projects[0]!.slug]);
    expect(
      publicPeopleAt([people[0]!, { ...people[0]!, id: "hidden-person", status: "hidden" }]).map(
        (person) => person.id,
      ),
    ).toEqual([people[0]!.id]);
  });

  it("keeps maturity and health independent in filters and the JSON projection", async () => {
    const experimental = filterPublicProjects({ maturity: "experimental" });
    expect(experimental).toHaveLength(1);
    expect(experimental[0]).toMatchObject({
      maturity: "experimental",
      health: "limited-maintenance",
    });
    expect(filterPublicProjects({ health: "limited-maintenance" })).toEqual(experimental);

    const response = getProjectsJson();
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      projects: Array<{ slug: string; maturity?: string; health?: string }>;
    };
    expect(body.projects.find((project) => project.slug === "organization-schema")).toMatchObject({
      maturity: "experimental",
      health: "limited-maintenance",
    });
  });
});
