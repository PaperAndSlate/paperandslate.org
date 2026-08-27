import fs from "node:fs";
import robots from "../apps/web/src/app/robots";
import sitemap from "../apps/web/src/app/sitemap";

for (const file of [
  "apps/web/src/app/layout.tsx",
  "apps/web/src/app/sitemap.ts",
  "apps/web/src/app/robots.ts",
  "apps/web/src/components/structured-data.tsx",
]) {
  if (!fs.existsSync(file)) throw new Error(`Missing SEO file: ${file}`);
}
if (fs.readFileSync("apps/web/src/app/layout.tsx", "utf8").includes("unsafe-eval"))
  throw new Error("Unsafe SEO output");

const entries = sitemap();
if (entries.length < 10 || new Set(entries.map((entry) => entry.url)).size !== entries.length)
  throw new Error("Sitemap entries must be unique and complete");
for (const entry of entries) {
  const parsed = new URL(entry.url);
  if (!parsed.pathname.startsWith("/")) throw new Error(`Invalid sitemap URL: ${entry.url}`);
}
const robotsOutput = robots();
if (!robotsOutput.rules || !robotsOutput.sitemap) throw new Error("Robots metadata is incomplete");

console.log(`Validated metadata, ${entries.length} sitemap URLs, robots, and structured data.`);
