import { describe, expect, it } from "vitest";
import {
  news,
  newsArticleSchema,
  publicNewsAt,
  publicReleasesAt,
  publishedNews,
  type ProjectRelease,
} from "../packages/content/src";
describe("publishing registry", () => {
  it("excludes drafts", () => {
    expect(publishedNews.length).toBeLessThan(news.length);
    expect(publishedNews.every((n) => n.status === "published")).toBe(true);
  });
  it("uses the injected publication clock for every publication state", () => {
    const make = (status: string, date: string) =>
      newsArticleSchema.parse({
        id: `${status}-${date}`,
        slug: `${status}-${date}`,
        title: status,
        summary: status,
        content: status,
        date,
        canonicalUrl: `/news/${status}-${date}`,
        status,
        type: "news",
      });
    const items = [
      make("draft", "2026-08-01"),
      make("scheduled", "2026-08-01"),
      make("scheduled", "2026-09-01"),
      make("published", "2026-08-01"),
      make("corrected", "2026-08-01"),
      make("superseded", "2026-08-01"),
      make("archived", "2026-08-01"),
    ];
    expect(publicNewsAt(items, "2026-08-27").map((item) => item.status)).toEqual([
      "scheduled",
      "published",
      "corrected",
    ]);
  });
  it("excludes planned and unreleased releases until an available date", () => {
    const releases = [
      {
        project: "planned",
        version: "next",
        status: "planned",
        summary: "",
        canonicalUrl: "/projects/planned",
      },
      {
        project: "unreleased",
        version: "next",
        status: "unreleased",
        summary: "",
        canonicalUrl: "/projects/unreleased",
      },
      {
        project: "future",
        version: "1.0",
        status: "available",
        releasedOn: "2027-01-01",
        summary: "",
        canonicalUrl: "/projects/future",
      },
      {
        project: "public",
        version: "1.0",
        status: "available",
        releasedOn: "2026-08-01",
        summary: "",
        canonicalUrl: "/projects/public",
      },
    ] as ProjectRelease[];
    expect(publicReleasesAt(releases, "2026-08-27").map((release) => release.project)).toEqual([
      "public",
    ]);
  });
});
