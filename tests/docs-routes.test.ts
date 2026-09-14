import { describe, expect, it } from "vitest";
import {
  docs,
  docProjectRecords,
  docRouteManifest,
  docTaxonomy,
  getDoc,
  rawRouteFor,
  resolveDocRoute,
} from "../apps/web/src/lib/docs";
import fs from "node:fs";
describe("static docs route model", () => {
  it("has visible source and version metadata", () => {
    expect(docs.length).toBeGreaterThan(0);
    expect(docs.every((doc) => doc.version && doc.ref && /^[a-f0-9]{64}$/.test(doc.hash))).toBe(
      true,
    );
  });
  it("keeps historical routes distinct", () => {
    const historical = docs.find((doc) => doc.id === "file-system:v1:index");
    expect(historical?.route).toBe("/docs/file-system/v/1.0");
    expect(historical?.aliases).toContain("/docs/file-system/v1");
    expect(docs.some((doc) => doc.route.includes("/next/"))).toBe(true);
  });
  it("resolves every public project root from the same normalized records", () => {
    const roots = docProjectRecords();
    expect(roots.map((project) => project.slug)).toEqual(
      [
        "course-catalog-schema",
        "curriculum-standards-schema",
        "file-system",
        "paper-and-slate",
        "tools-and-libraries",
        "well-known-discovery",
        "organization-schema",
      ].sort(),
    );
    for (const project of roots) {
      const match = resolveDocRoute(project.root);
      expect(match?.kind).toBe("project-root");
      expect(match?.doc.id).toBe(project.document.id);
      expect(getDoc(project.root)?.canonicalRoute).toBe(project.root);
    }
  });
  it("keeps aliases, raw routes, missing routes, and malformed routes deterministic", () => {
    const historical = getDoc("/docs/file-system/v1");
    expect(historical?.canonicalRoute).toBe("/docs/file-system/v/1.0");
    expect(resolveDocRoute("/docs/file-system/v1")?.kind).toBe("alias");
    expect(rawRouteFor(historical!)).toBe("/docs/raw/file-system/v/1.0");
    expect(getDoc("/docs/raw/file-system/v/1.0")).toBeUndefined();
    expect(resolveDocRoute("/docs/does-not-exist")).toBeNull();
    expect(resolveDocRoute("file-system")).toBeNull();
    expect(docRouteManifest()).toContain("/docs/paper-and-slate");
  });
});
describe("docs taxonomy route contract", () => {
  it("declares every catalog landing", () => {
    for (const section of [
      "getting-started",
      "concepts",
      "guides",
      "reference",
      "tools",
      "governance",
    ])
      expect(fs.existsSync(`apps/web/src/app/(docs)/docs/${section}/page.tsx`)).toBe(true);
  });
});

describe("public discovery contract", () => {
  it("keeps draft documentation out of discovery surfaces", async () => {
    const { docsForAi, docsForSearch, docsForSitemap } = await import("../apps/web/src/lib/docs");
    for (const records of [docsForAi(), docsForSearch(), docsForSitemap()])
      expect(records.some((doc) => doc.status === "draft")).toBe(false);
  });
  it("declares the noindex component board as an internal review surface", () => {
    expect(fs.existsSync("apps/web/src/app/(public)/design-system/page.tsx")).toBe(true);
  });
});

describe("source-document link mapping", () => {
  const boundaryRoutes = [
    ["/docs/course-catalog-schema/data-boundary", "/docs/standards-course-schema/data-boundary"],
    [
      "/docs/curriculum-standards-schema/registry-data-boundary",
      "/docs/standards-curriculum-standards/registry-data-boundary",
    ],
    ["/docs/well-known-discovery/eom-boundary", "/docs/standards-discovery/eom-boundary"],
    ["/docs/organization-schema/eom-boundary", "/docs/standards-organization-schema/eom-boundary"],
    [
      "/docs/tools-and-libraries/license-and-endorsement-boundary",
      "/docs/standards-tools-and-libraries/license-and-endorsement-boundary",
    ],
  ] as const;

  it("maps each ingested source boundary link to an existing public document", () => {
    for (const [publicRoute, sourceRoute] of boundaryRoutes) {
      expect(resolveDocRoute(publicRoute)?.doc.canonicalRoute).toBe(publicRoute);
      expect(docs.some((doc) => doc.content.includes(`](${sourceRoute})`))).toBe(false);
      expect(docs.some((doc) => doc.content.includes(`](${publicRoute})`))).toBe(true);
    }
  });

  it("does not emit source-adjacent Markdown or invented root aliases", () => {
    expect(docTaxonomy().some((topic) => topic.endsWith(".md"))).toBe(false);
    for (const doc of docs) {
      expect(doc.content).not.toMatch(/\]\([^)]*\.md(?:[#?][^)]*)?\)/i);
      expect(doc.content).not.toMatch(/\]\(\/docs\/[^)]+\.md(?:[#?][^)]*)?\)/i);
    }
  });
});
