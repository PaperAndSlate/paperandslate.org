import { newsArticleSchema, type NewsArticle } from "./models";
import { publicNewsAt } from "./publication";
export const news: NewsArticle[] = [
  {
    id: "news:local-publishing-foundations",
    slug: "local-publishing-foundations",
    title: "A local foundation for open publishing",
    summary:
      "The Paper & Slate public site now records reviewed updates and project context in version-controlled local registries.",
    content:
      "This milestone establishes a small, reviewable publishing foundation. It does not claim adoption, sponsorship, or a finished standard.",
    date: "2026-08-20",
    publishedAt: "2026-08-20",
    canonicalUrl: "/news/local-publishing-foundations",
    status: "published",
    type: "news",
    tags: ["implementation"],
    projects: [],
    author: "Paper & Slate maintainers",
    related: ["project:file-system"],
    image: "/media/offering-news.jpg",
    imageAlt: "Open pages and a pencil representing a public update",
  },
  {
    id: "news:future-draft",
    slug: "future-draft",
    title: "Unpublished draft",
    summary: "This must never appear publicly.",
    content: "Draft content.",
    date: "2027-01-01",
    canonicalUrl: "/news/future-draft",
    status: "draft",
    type: "news",
    tags: [],
    projects: [],
    author: "Paper & Slate maintainers",
    related: [],
  },
];
export const validatedNews = news.map((item) => newsArticleSchema.parse(item));
export const newsCategories = [
  "news",
  "release",
  "rfc",
  "decision",
  "implementation",
  "governance",
  "research",
  "report",
] as const;
export const publishedNews = publicNewsAt(validatedNews);
export const getNews = (slug: string) => publishedNews.find((item) => item.slug === slug);
