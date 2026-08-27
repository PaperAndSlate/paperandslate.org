import {
  decisions,
  news,
  policies,
  projects,
  rfcs,
  reports,
  validatedReleases,
} from "../packages/content/src";
const ids = [
  ...news.map((x) => x.id),
  ...rfcs.map((x) => `rfc:${x.number}`),
  ...decisions.map((x) => x.id),
  ...policies.map((x) => `policy:${x.slug}`),
  ...projects.map((x) => `project:${x.slug}`),
];
if (new Set(ids).size !== ids.length) throw new Error("Content IDs must be unique");
for (const item of news) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(item.date) || !item.canonicalUrl || !item.summary)
    throw new Error(`Invalid news record ${item.id}`);
  if (item.status === "published" && item.date > "2026-08-26")
    throw new Error(`Future publication ${item.id}`);
}
for (const rfc of rfcs)
  if (!Number.isInteger(rfc.number) || !rfc.owner || !rfc.canonicalUrl)
    throw new Error(`Invalid RFC ${rfc.number}`);
for (const decision of decisions)
  if (!decision.decisionMaker || !decision.date) throw new Error(`Invalid decision ${decision.id}`);
for (const policy of policies)
  if (!policy.version || !policy.effectiveDate || !policy.canonicalUrl)
    throw new Error(`Invalid policy ${policy.slug}`);
if (
  projects.some(
    (project) =>
      project.visibility === "public" &&
      (!project.description || project.overview.length === 0 || !project.lastMeaningfulUpdate),
  )
)
  throw new Error("Public project metadata is required");
if (reports.some((report) => report.status === "published" && !report.summary))
  throw new Error("Published reports require summaries");
if (validatedReleases.some((release) => release.status !== "available" && release.releasedOn))
  throw new Error("Unreleased releases cannot have dates");
console.log(`Validated ${ids.length} local content records.`);
