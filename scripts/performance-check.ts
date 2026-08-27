import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

type LighthouseAudit = {
  numericValue?: number;
  details?: { items?: Array<{ resourceType?: string; transferSize?: number }> };
};
type LighthouseResult = {
  categories?: Record<string, { score?: number }>;
  audits?: Record<string, LighthouseAudit>;
};
const root = process.cwd();
const config = YAML.parse(
  fs.readFileSync(path.join(root, "config/performance-budgets.yml"), "utf8"),
) as { budgets?: Record<string, number> };
const budgets = config.budgets;
if (
  !budgets ||
  Object.values(budgets).some((value) => typeof value !== "number" || !Number.isFinite(value))
)
  throw new Error("Performance budgets are missing numeric values");
const lighthouseDir = path.join(root, ".generated/launch/lighthouse");
const reports = fs.existsSync(lighthouseDir)
  ? fs.readdirSync(lighthouseDir).filter((file) => /^lhr-.*\.json$/.test(file))
  : [];
if (reports.length === 0)
  throw new Error("No Lighthouse JSON evidence found; run pnpm lighthouse first");
for (const file of reports) {
  const result = JSON.parse(
    fs.readFileSync(path.join(lighthouseDir, file), "utf8"),
  ) as LighthouseResult;
  const checks: Array<[string, number | undefined, number]> = [
    ["performance", result.categories?.performance?.score, budgets.lighthousePerformance],
    ["accessibility", result.categories?.accessibility?.score, budgets.accessibility],
    ["best-practices", result.categories?.["best-practices"]?.score, budgets.bestPractices],
    ["seo", result.categories?.seo?.score, budgets.seo],
    [
      "largest-contentful-paint",
      result.audits?.["largest-contentful-paint"]?.numericValue,
      budgets.lcpMs,
    ],
    [
      "cumulative-layout-shift",
      result.audits?.["cumulative-layout-shift"]?.numericValue,
      budgets.cls,
    ],
    ["total-blocking-time", result.audits?.["total-blocking-time"]?.numericValue, budgets.tbtMs],
  ];
  for (const [name, actual, budget] of checks) {
    if (actual === undefined) throw new Error(`Lighthouse evidence is missing ${name}`);
    const score =
      name === "performance" ||
      name === "accessibility" ||
      name === "best-practices" ||
      name === "seo";
    const pass = score ? actual >= budget : actual <= budget;
    if (!pass)
      throw new Error(`Performance budget failed for ${file}: ${name}=${actual}, budget=${budget}`);
  }
}
console.log(
  `Validated ${reports.length} Lighthouse runs against performance, accessibility, SEO, LCP, CLS, and TBT budgets.`,
);
