import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

type LockPackage = { resolution?: { integrity?: string }; dev?: boolean };
type Lockfile = { packages?: Record<string, LockPackage> };
const root = process.cwd();
const output = path.join(root, "evidence", "local", "sbom");
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
  ...(item.integrity
    ? { hashes: [{ alg: "SHA-512", content: item.integrity.replace(/^sha512-/, "") }] }
    : {}),
  properties: [{ name: "pnpm:development", value: String(item.dev) }],
});
const gitSha = (() => {
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
const lockHash = createHash("sha256").update(lockText).digest("hex");
const components = packages.map(componentFor);
const metadata = {
  timestamp: new Date().toISOString(),
  tools: [{ vendor: "Paper & Slate", name: "pnpm-lock SBOM generator", version: "1" }],
  component: { type: "application", name: "paper-and-slate-web", version: releaseId },
  properties: [
    { name: "paper-slate:release-id", value: releaseId },
    { name: "paper-slate:git-sha", value: gitSha ?? "uncommitted" },
    { name: "paper-slate:lockfile-sha256", value: lockHash },
    {
      name: "paper-slate:container-digest",
      value: process.env.CONTAINER_IMAGE_DIGEST || "pending",
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
fs.writeFileSync(path.join(output, "cyclonedx.json"), `${JSON.stringify(cyclonedx, null, 2)}\n`);
fs.writeFileSync(path.join(output, "spdx.json"), `${JSON.stringify(spdx, null, 2)}\n`);
fs.writeFileSync(
  path.join(output, "manifest.json"),
  `${JSON.stringify({ releaseId, gitSha, lockHash, packageCount: packages.length, generatedAt: metadata.timestamp }, null, 2)}\n`,
);
console.log(`Generated CycloneDX and SPDX SBOMs for ${packages.length} locked packages.`);
