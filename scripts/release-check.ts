import { validatedReleases as releases } from "../packages/content/src";
for (const release of releases) {
  if (!release.project || !release.version || !release.summary || !release.canonicalUrl)
    throw new Error("Invalid release metadata");
  if (release.status !== "available" && release.releasedOn)
    throw new Error("Unreleased item has release date");
}
console.log(`Validated ${releases.length} project release records.`);
