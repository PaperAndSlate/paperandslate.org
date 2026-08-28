import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { integrityToCycloneDxHash } from "./sbom-core";
import { readSourceState } from "./source-state";

type LockPackage = { resolution?: { integrity?: string }; dev?: boolean };
type Lockfile = { packages?: Record<string, LockPackage> };
const root = process.cwd();
const output = path.join(root, "evidence", "local", "sbom");
const launchOutput = path.join(root, ".generated", "launch", "sbom-manifest.json");
const containerEvidencePath = path.join(root, ".generated", "launch", "container-check.json");
const lockText = fs.readFileSync(path.join(root, "pnpm-lock.yaml"), "utf8");
const lock = YAML.parse(lockText) as Lockfile;
const packages = Object.entries(lock.packages ?? {})
  .map(([key, value]) => {
    const versionBoundary = key.lastIndexOf("@");
    const rawName = versionBoundary > 0 ? key.slice(0, versionBoundary) : key;
    const rawVersion = versionBoundary > 0 ? key.slice(versionBoundary + 1) : "unknown";
    const version = rawVersion.replace(/\(.+\)$/, "");
    const name = rawName || key;
    return { key, name, version, integrity: value.resolution?.integrity, dev: value.dev === true };
  })
  .filter((item) => item.name && item.version && item.version !== "unknown")
  .sort((a, b) => a.name.localeCompare(b.name) || a.version.localeCompare(b.version));

const purl = (name: string, version: string) =>
  `pkg:npm/${name.startsWith("@") ? `%40${name.slice(1)}` : name}@${version}`;
const componentFor = (item: (typeof packages)[number]) => ({
  type: "library",
  name: item.name,
  version: item.version,
  "bom-ref": purl(item.name, item.version),
  ...(item.integrity ? { hashes: [integrityToCycloneDxHash(item.integrity)] } : {}),
  properties: [{ name: "pnpm:development", value: String(item.dev) }],
});
const resolvedGitSha = (() => {
  try {
    return execFileSync(process.platform === "win32" ? "git.exe" : "git", ["rev-parse", "HEAD"], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
})();
const releaseId = process.env.RELEASE_ID || "local-development";
const gitSha = process.env.GIT_SHA || resolvedGitSha || "uncommitted";
const containerEvidence = (() => {
  if (!fs.existsSync(containerEvidencePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(containerEvidencePath, "utf8")) as {
      status?: string;
      repoDigests?: string[];
      imageId?: string | null;
    };
  } catch {
    return null;
  }
})();
const containerDigest =
  process.env.CONTAINER_IMAGE_DIGEST ||
  (containerEvidence?.status === "passed"
    ? containerEvidence.repoDigests?.[0] || containerEvidence.imageId || "pending"
    : "pending");
const lockHash = createHash("sha256").update(lockText).digest("hex");
const components = packages.map(componentFor);
const metadata = {
  timestamp: new Date().toISOString(),
  tools: [{ vendor: "Paper & Slate", name: "pnpm-lock SBOM generator", version: "1" }],
  component: { type: "application", name: "paper-and-slate-web", version: releaseId },
  properties: [
    { name: "paper-slate:release-id", value: releaseId },
    { name: "paper-slate:git-sha", value: gitSha },
    { name: "paper-slate:lockfile-sha256", value: lockHash },
    {
      name: "paper-slate:container-digest",
      value: containerDigest,
    },
  ],
};
const cyclonedx = {
  bomFormat: "CycloneDX",
  specVersion: "1.5",
  serialNumber: `urn:uuid:${createHash("sha256").update(`${releaseId}:${lockHash}`).digest("hex").slice(0, 32)}`,
  version: 1,
  metadata,
  components,
};
const spdxPackages = packages.map((item) => ({
  SPDXID: `SPDXRef-${createHash("sha256").update(purl(item.name, item.version)).digest("hex").slice(0, 16)}`,
  name: item.name,
  versionInfo: item.version,
  downloadLocation: "NOASSERTION",
  filesAnalyzed: false,
  licenseConcluded: "NOASSERTION",
  licenseDeclared: "NOASSERTION",
  copyrightText: "NOASSERTION",
  ...(item.integrity
    ? {
        checksums: [
          {
            algorithm: "SHA512",
            checksumValue: integrityToCycloneDxHash(item.integrity).content,
          },
        ],
        externalRefs: [
          {
            referenceCategory: "PACKAGE-MANAGER",
            referenceType: "purl",
            referenceLocator: purl(item.name, item.version),
          },
        ],
      }
    : {}),
}));
const spdx = {
  SPDXID: "SPDXRef-DOCUMENT",
  spdxVersion: "SPDX-2.3",
  creationInfo: { created: metadata.timestamp, creators: ["Tool: paper-and-slate-sbom-1"] },
  name: `paper-and-slate-web-${releaseId}`,
  documentNamespace: `https://paperandslate.local/sbom/${releaseId}/${lockHash}`,
  dataLicense: "CC0-1.0",
  packages: spdxPackages,
  relationships: spdxPackages.map((item) => ({
    SPDXID: "SPDXRef-DOCUMENT",
    relationshipType: "DESCRIBES",
    relatedSPDXElement: item.SPDXID,
  })),
};

fs.mkdirSync(output, { recursive: true });
fs.mkdirSync(path.dirname(launchOutput), { recursive: true });
fs.writeFileSync(path.join(output, "cyclonedx.json"), `${JSON.stringify(cyclonedx, null, 2)}\n`);
fs.writeFileSync(path.join(output, "spdx.json"), `${JSON.stringify(spdx, null, 2)}\n`);
const manifest = {
  schemaVersion: 1,
  releaseId,
  gitSha,
  source: readSourceState(root),
  lockHash,
  packageCount: packages.length,
  containerDigest,
  generatedAt: metadata.timestamp,
  formats: ["CycloneDX 1.5", "SPDX 2.3"],
};
fs.writeFileSync(path.join(output, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
fs.writeFileSync(launchOutput, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Generated CycloneDX and SPDX SBOMs for ${packages.length} locked packages.`);
