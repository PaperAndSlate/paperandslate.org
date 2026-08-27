import { z } from "zod";
export const contentStatusSchema = z.enum(["planned", "experimental", "unreleased", "available"]);
export type ContentStatus = z.infer<typeof contentStatusSchema>;
export const maturitySchema = z.enum([
  "planned",
  "experimental",
  "alpha",
  "beta",
  "stable",
  "deprecated",
  "archived",
]);
export type ProjectMaturity = z.infer<typeof maturitySchema>;
export const healthSchema = z.enum([
  "active",
  "maintained",
  "limited-maintenance",
  "paused",
  "unmaintained",
]);
export type ProjectHealth = z.infer<typeof healthSchema>;
export const releaseStateSchema = z.enum(["none", "preview", "released", "archived"]);
export const provenanceStatusSchema = z.enum(["repository", "review-pending", "approved"]);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const linkSchema = z.object({
  label: z.string().min(1),
  url: z.string().startsWith("/").or(z.string().url()),
});
const relationshipSchema = z.object({ project: z.string().min(1), label: z.string().min(1) });
export const projectSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  shortName: z.string().optional(),
  summary: z.string(),
  description: z.string(),
  type: z.enum(["standard", "schema", "format", "tool", "library", "registry", "platform"]),
  status: contentStatusSchema,
  maturity: maturitySchema.default("planned"),
  health: healthSchema.default("paused"),
  releaseState: releaseStateSchema.default("none"),
  version: z.string().optional(),
  nextVersion: z.string().optional(),
  repository: z.string().url().or(z.string().startsWith("git@")).nullable().default(null),
  docsRoot: z.string(),
  maintainers: z.array(z.string()),
  licenses: z.array(z.string()),
  licenseReviewStatus: z
    .enum(["not-reviewed", "review-pending", "reviewed"])
    .default("not-reviewed"),
  lastMeaningfulUpdate: date,
  dependencies: z.array(z.string()),
  relationships: z.array(relationshipSchema).default([]),
  rfcNumbers: z.array(z.number().int().positive()).default([]),
  decisionIds: z.array(z.string()).default([]),
  roadmapIds: z.array(z.string()).default([]),
  newsIds: z.array(z.string()).default([]),
  tags: z.array(z.string()),
  featured: z.boolean(),
  visibility: z.enum(["public", "hidden", "preview"]),
  icon: z.string().optional(),
  image: z.string().startsWith("/").optional(),
  imageAlt: z.string().optional(),
  provenanceStatus: provenanceStatusSchema.default("repository"),
  links: z.array(linkSchema),
  details: z.string(),
  overview: z.array(z.string()).min(1).default([]),
  interoperability: z.array(z.string()).default([]),
});
export type Project = z.infer<typeof projectSchema>;
export const foundationPageSchema = z.object({
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  status: contentStatusSchema,
});
export type FoundationPage = z.infer<typeof foundationPageSchema>;
export const publicationStatusSchema = z.enum(["draft", "published", "scheduled", "withdrawn"]);
export type PublicationStatus = z.infer<typeof publicationStatusSchema>;
export const newsArticleSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  content: z.string(),
  date,
  canonicalUrl: z.string().startsWith("/"),
  status: publicationStatusSchema,
  type: z.enum([
    "news",
    "release",
    "rfc",
    "decision",
    "announcement",
    "project-update",
    "governance",
    "implementation",
    "research",
    "report",
  ]),
  tags: z.array(z.string()).default([]),
  projects: z.array(z.string()).default([]),
  author: z.string().default("Paper & Slate maintainers"),
  related: z.array(z.string()).default([]),
  correctionOf: z.string().optional(),
  supersedes: z.string().optional(),
  image: z.string().startsWith("/").optional(),
  imageAlt: z.string().optional(),
  publishedAt: date.optional(),
});
export type NewsArticle = z.infer<typeof newsArticleSchema>;
export const rfcSchema = z.object({
  number: z.number().int().positive(),
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  status: z.enum(["proposed", "accepted", "rejected", "superseded"]),
  owner: z.string(),
  published: date,
  content: z.string(),
  canonicalUrl: z.string().startsWith("/"),
});
export type Rfc = z.infer<typeof rfcSchema>;
export const decisionSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  status: z.enum(["accepted", "reversed"]),
  decisionMaker: z.string(),
  date,
  content: z.string(),
  canonicalUrl: z.string().startsWith("/"),
});
export type Decision = z.infer<typeof decisionSchema>;
export const policySchema = z.object({
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  version: z.string(),
  effectiveDate: date,
  status: z.enum(["current", "archived"]),
  content: z.string(),
  canonicalUrl: z.string().startsWith("/"),
  kind: z.enum(["policy", "license"]),
});
export type Policy = z.infer<typeof policySchema>;
export const projectReleaseSchema = z.object({
  project: z.string(),
  version: z.string(),
  status: contentStatusSchema,
  releasedOn: date.optional(),
  summary: z.string(),
  canonicalUrl: z.string().startsWith("/"),
  notes: z.array(z.string()).default([]),
  provenanceStatus: provenanceStatusSchema.default("repository"),
});
export type ProjectRelease = z.infer<typeof projectReleaseSchema>;
export const reportSchema = z.object({
  year: z.number().int(),
  title: z.string(),
  status: z.enum(["planned", "published"]),
  summary: z.string(),
  highlights: z.array(z.string()),
  canonicalUrl: z.string().startsWith("/"),
  publishedOn: date.optional(),
});
export type Report = z.infer<typeof reportSchema>;
