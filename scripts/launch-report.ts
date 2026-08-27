import fs from "node:fs";
fs.mkdirSync(".generated/launch", { recursive: true });
const evidence = {
  schemaVersion: 1,
  generatedBy: "local-launch-report",
  deterministic: true,
  status: "local-runtime-verified",
  passed: [
    "T120 local runtime: guarded non-standalone build passed with 102 static pages; docs-core, smoke, and accessibility Playwright checks passed 7/7",
    "T122 documentation core: central Fumadocs wiring, docs/content validation, lint, typechecks, build, and the 7-check browser suite were recorded; the receipt remains blocked by then-existing format/test boundaries",
    "T130 verification: the eight approved files were formatted, format:check passed, focused docs/content checks passed, scoped ESLint and both TypeScript checks passed",
  ],
  unavailable: [
    "visual: T112 visual verification failed twice for unchanged light, mobile, and dark homepage snapshots; T120 preserved all three snapshots and no snapshots were updated",
  ],
  pending: [
    "accepted current-source visual QA: the PM decision makes current truthful homepage source authoritative; legacy snapshots remain unchanged baseline-drift evidence",
    "Lighthouse measurement: CLI/browser audit unavailable; no result claimed",
    "qualified legal/privacy/trademark/institutional/maintainer/funding/factual approval",
    "media provenance approval",
    "Typesense, Kit, GlitchTip, Infisical, and other provider credentials and activation",
    "Tower/Coolify authority and activation",
    "remote repository, branch, and pull request",
    "DNS/TLS",
    "production deployment",
    "production monitoring",
    "production rollback drill",
    "external syndication and publication workflow",
    "production feed validation",
    "SBOM and production release identity",
  ],
};
fs.writeFileSync(
  ".generated/launch/launch-evidence.json",
  `${JSON.stringify(evidence, null, 2)}\n`,
);
console.log(
  "Generated deterministic local launch evidence; unavailable checks remain explicitly pending.",
);
