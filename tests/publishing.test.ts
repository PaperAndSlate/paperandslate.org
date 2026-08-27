import { describe, expect, it } from "vitest";
import { news, publishedNews } from "../packages/content/src";
describe("publishing registry", () => {
  it("excludes drafts", () => {
    expect(publishedNews.length).toBeLessThan(news.length);
    expect(publishedNews.every((n) => n.status === "published")).toBe(true);
  });
});
