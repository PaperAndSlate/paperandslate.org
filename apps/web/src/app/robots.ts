import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const preview = process.env.VERCEL_ENV === "preview" || process.env.PAPER_SLATE_ENV === "preview";
  return {
    rules: { userAgent: "*", disallow: preview ? "/" : ["/api/", "/search"] },
    sitemap: preview ? undefined : `${base}/sitemap.xml`,
  };
}
