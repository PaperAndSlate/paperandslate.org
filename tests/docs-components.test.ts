import { describe, expect, it } from "vitest";
import { docs } from "../apps/web/src/lib/docs";
import { isReviewedCentral } from "../apps/web/src/lib/docs-fumadocs";
import { renderRestrictedMarkdown } from "../apps/web/src/components/docs-renderer";
describe("documentation rendering boundary", () => {
  it("limits Fumadocs rendering to reviewed central pages", () => {
    expect(docs.filter(isReviewedCentral).map((doc) => doc.sourceMode)).toEqual([
      "central",
      "central",
      "central",
      "central",
    ]);
    expect(
      docs.filter((doc) => !isReviewedCentral(doc)).some((doc) => doc.sourceMode !== "central"),
    ).toBe(true);
  });
  it("keeps raw and provenance metadata available", () => {
    expect(
      docs.every((doc) => doc.sourceHash && doc.ref && doc.canonicalRoute.startsWith("/docs/")),
    ).toBe(true);
  });
  it("renders noncentral MDX expressions as inert text", () => {
    const rendered = JSON.stringify(
      renderRestrictedMarkdown("{process.env.SECRET}\n\n[Documentation](/docs/paper-and-slate)"),
    );
    expect(rendered).toContain("{process.env.SECRET}");
    expect(rendered).toContain("/docs/paper-and-slate");
  });
});
