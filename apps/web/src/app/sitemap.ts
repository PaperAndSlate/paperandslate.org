import type { MetadataRoute } from "next";
import {
  projects,
  foundationPages,
  publishedNews,
  newsCategories,
  policies,
  rfcs,
  decisions,
  reports,
  publicReleases,
} from "@paper-and-slate/content";
import { docsForSitemap, docProjectRecords, isPublicIndexDocument } from "../lib/docs";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const docSections = [
    "getting-started",
    "concepts",
    "guides",
    "reference",
    "tools",
    "governance",
  ].map((section) => `/docs/${section}`);
  const governance = [
    "contributing",
    "code-of-conduct",
    "security",
    "conflicts",
    "trademarks",
    "licenses",
  ].map((section) => `/governance/${section}`);
  const tags = [...new Set(publishedNews.flatMap((item) => item.tags))].map(
    (tag) => `/news/tag/${tag}`,
  );
  const categories = newsCategories.map((category) => `/news/category/${category}`);
  const paths = [
    "/",
    "/foundation",
    "/projects",
    "/standards",
    "/standards/explore",
    "/standards/coverage",
    "/standards/compare",
    "/standards/sources",
    "/standards/frameworks",
    "/docs",
    "/governance",
    "/news",
    "/accessibility",
    "/privacy",
    "/terms",
    "/security",
    "/trademarks",
    "/licenses",
    "/code-of-conduct",
    ...docSections,
    ...governance,
    ...categories,
    ...tags,
    ...foundationPages.map((p) => `/foundation/${p.slug}`),
    ...projects.map((p) => `/projects/${p.slug}`),
    ...publishedNews.map((n) => n.canonicalUrl),
    ...rfcs.map((rfc) => rfc.canonicalUrl),
    ...decisions.map((decision) => decision.canonicalUrl),
    ...policies.map((policy) => policy.canonicalUrl),
    ...reports
      .filter((report) => report.status === "published")
      .map((report) => report.canonicalUrl),
    ...docProjectRecords()
      .filter((project) => isPublicIndexDocument(project.document))
      .map((project) => project.root),
    ...docsForSitemap().map((doc) => doc.canonicalRoute),
    ...publicReleases.map((release) => release.canonicalUrl),
  ];
  return [...new Set(paths)].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.6,
  }));
}
