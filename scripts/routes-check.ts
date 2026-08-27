import fs from "node:fs";
import YAML from "yaml";
const required = [
  "apps/web/src/app/page.tsx",
  "apps/web/src/app/not-found.tsx",
  "apps/web/src/app/error.tsx",
  "apps/web/src/app/projects.json/route.ts",
  "apps/web/src/app/(public)/foundation/reports/[year]/page.tsx",
  "apps/web/src/app/(public)/projects/[slug]/releases/page.tsx",
  "apps/web/src/app/(public)/design-system/page.tsx",
  "apps/web/src/app/(public)/privacy/page.tsx",
  "apps/web/src/app/(public)/terms/page.tsx",
  "apps/web/src/app/(public)/security/page.tsx",
  "apps/web/src/app/(docs)/docs/getting-started/page.tsx",
  "apps/web/src/app/(docs)/docs/concepts/page.tsx",
  "apps/web/src/app/(docs)/docs/guides/page.tsx",
  "apps/web/src/app/(docs)/docs/reference/page.tsx",
  "apps/web/src/app/(docs)/docs/tools/page.tsx",
  "apps/web/src/app/(docs)/docs/governance/page.tsx",
  "apps/web/src/app/(public)/news/category/[category]/page.tsx",
  "apps/web/src/app/(public)/news/tag/[tag]/page.tsx",
  "apps/web/src/app/(public)/governance/contributing/page.tsx",
  "apps/web/src/app/(public)/governance/code-of-conduct/page.tsx",
  "apps/web/src/app/(public)/governance/security/page.tsx",
  "apps/web/src/app/(public)/governance/conflicts/page.tsx",
  "apps/web/src/app/(public)/governance/trademarks/page.tsx",
  "apps/web/src/app/(public)/governance/licenses/page.tsx",
];
for (const file of required)
  if (!fs.existsSync(file)) throw new Error(`Missing public route ${file}`);
const redirects = YAML.parse(fs.readFileSync("config/redirects.yml", "utf8")).redirects as {
  from: string;
  to: string;
}[];
if (redirects.some((r) => !r.from || !r.to || r.from === r.to))
  throw new Error("Invalid redirect registry");
console.log(`Validated ${required.length} public routes and ${redirects.length} redirects.`);
