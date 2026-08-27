import fs from "node:fs";
import {
  publicProjects,
  news,
  rfcs,
  decisions,
  policies,
  reports,
  people,
  roadmap,
} from "../packages/content/src";
import { normalizeRecords, type SearchRecord } from "../packages/search/src";
type Doc = {
  id: string;
  title: string;
  description?: string;
  content: string;
  route: string;
  status?: string;
};
const docs = JSON.parse(fs.readFileSync(".generated/docs/documents.json", "utf8")) as Doc[];
const records: SearchRecord[] = [
  ...publicProjects.map((p) => ({
    id: `project:${p.slug}`,
    title: p.name,
    summary: p.summary,
    text: p.details,
    route: `/projects/${p.slug}`,
    type: "project" as const,
    source: "content" as const,
    properties: p.tags,
  })),
  ...docs
    .filter((d) => d.status !== "draft" && d.status !== "scheduled" && d.status !== "withdrawn")
    .map((d) => ({
      id: d.id,
      title: d.title,
      summary: d.description ?? "Untitled documentation",
      text: d.content,
      route: d.route,
      type: "documentation" as const,
      source: "docs" as const,
    })),
  ...news
    .filter((n) => n.status === "published")
    .map((n) => ({
      id: n.id,
      title: n.title,
      summary: n.summary,
      text: n.content,
      route: n.canonicalUrl,
      type: "news" as const,
      source: "news" as const,
      date: n.date,
      properties: n.tags,
    })),
  ...rfcs.map((r) => ({
    id: `rfc:${r.number}`,
    title: `RFC ${r.number}: ${r.title}`,
    summary: r.summary,
    text: r.content,
    route: r.canonicalUrl,
    type: "rfc" as const,
    source: "governance" as const,
    date: r.published,
    aliases: [`rfc ${r.number}`, `rfc:${r.number}`, String(r.number)],
    requirements: [r.title],
  })),
  ...decisions.map((d) => ({
    id: `decision:${d.id}`,
    title: d.title,
    summary: d.summary,
    text: d.content,
    route: d.canonicalUrl,
    type: "decision" as const,
    source: "governance" as const,
    date: d.date,
  })),
  ...policies.map((p) => ({
    id: `policy:${p.slug}`,
    title: p.title,
    summary: p.summary,
    text: p.content,
    route: p.canonicalUrl,
    type: "policy" as const,
    source: "governance" as const,
    date: p.effectiveDate,
  })),
  ...reports
    .filter((r) => r.status === "published")
    .map((r) => ({
      id: `report:${r.year}`,
      title: r.title,
      summary: r.summary,
      text: r.highlights.join(" "),
      route: r.canonicalUrl,
      type: "report" as const,
      source: "content" as const,
    })),
  ...people
    .filter((p) => p.status !== "hidden")
    .map((p) => ({
      id: `person:${p.id}`,
      title: p.name,
      summary: p.role,
      text: p.summary,
      route: "/foundation/people",
      type: "governance" as const,
      source: "content" as const,
    })),
  ...roadmap.map((r) => ({
    id: `roadmap:${r.id}`,
    title: r.title,
    summary: r.summary,
    text: r.summary,
    route: "/foundation/roadmap",
    type: "governance" as const,
    source: "content" as const,
  })),
].sort((a, b) => a.id.localeCompare(b.id));
const validated = normalizeRecords(records);
fs.mkdirSync(".generated/search", { recursive: true });
fs.writeFileSync(
  ".generated/search/search-records.json",
  `${JSON.stringify(validated, null, 2)}\n`,
);
console.log(`Generated ${validated.length} deterministic local search records.`);
