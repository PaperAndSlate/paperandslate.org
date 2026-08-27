import { describe, expect, it } from "vitest";
import { docs } from "../apps/web/src/lib/docs";
import { isReviewedCentral } from "../apps/web/src/lib/docs-fumadocs";
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
});
