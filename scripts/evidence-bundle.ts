import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const releaseId = (
  process.env.RELEASE_ID || `v1-rc-${new Date().toISOString().slice(0, 10)}`
).replace(/[^A-Za-z0-9._-]/g, "-");
const bundleRoot = path.join(root, "evidence", releaseId);
const git = (args: string[]) => {
  try {
    return execFileSync(process.platform === "win32" ? "git.exe" : "git", args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
};
const copyIfPresent = (source: string, destination: string) => {
  const absoluteSource = path.join(root, source);
  if (!fs.existsSync(absoluteSource)) return false;
  const absoluteDestination = path.join(bundleRoot, destination);
  fs.mkdirSync(path.dirname(absoluteDestination), { recursive: true });
  fs.cpSync(absoluteSource, absoluteDestination, { recursive: true });
  return true;
};
const files = [
  [".generated/requirements/requirements.json", "traceability/requirements.json"],
  [".generated/docs/documents.json", "content/documents.json"],
  [".generated/docs/docs-sources.lock.json", "content/source-lock.json"],
  [".generated/docs/source-provenance.json", "content/source-provenance.json"],
  [".generated/docs/search-records.json", "search/docs-records.json"],
  [".generated/search/search-records.json", "search/search-records.json"],
  [".generated/launch/lighthouse", "lighthouse"],
  [".generated/launch/launch-evidence.json", "launch/launch-evidence.json"],
  ["evidence/local/sbom", "sbom"],
  ["evidence/local/security", "security"],
  ["playwright-report", "browser/playwright-report"],
  ["test-results", "browser/test-results"],
] as const;

fs.rmSync(bundleRoot, { recursive: true, force: true });
fs.mkdirSync(bundleRoot, { recursive: true });
const copied = files.filter(([source, destination]) => copyIfPresent(source, destination));
const pending = {
  status: "pending-owner-or-external-evidence",
  approvals: [
    "qualified legal/privacy/trademark/institutional/funding review",
    "factual, maintainer, and media-provenance approval",
  ],
  authority: [
    "Forgejo repository owner and branch/PR authority",
    "DNS/TLS and Tower/Coolify deployment authority",
    "provider credentials and production monitoring/rollback authority",
  ],
  publication: [
    "publication workflow owner",
    "syndication destinations and production feed acceptance",
  ],
};
fs.mkdirSync(path.join(bundleRoot, "approvals"), { recursive: true });
fs.writeFileSync(
  path.join(bundleRoot, "approvals", "pending.json"),
  `${JSON.stringify(pending, null, 2)}\n`,
);

const hashes: Record<string, { sha256: string; bytes: number }> = {};
const hashTree = (directory: string) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    const relative = path.relative(bundleRoot, absolute).replaceAll(path.sep, "/");
    if (entry.isDirectory()) hashTree(absolute);
    else if (relative !== "manifest.json" && relative !== "hashes.json") {
      const bytes = fs.readFileSync(absolute);
      hashes[relative] = {
        sha256: createHash("sha256").update(bytes).digest("hex"),
        bytes: bytes.length,
      };
    }
  }
};
hashTree(bundleRoot);
fs.writeFileSync(path.join(bundleRoot, "hashes.json"), `${JSON.stringify(hashes, null, 2)}\n`);
const manifest = {
  schemaVersion: 1,
  status: "release-candidate",
  releaseId,
  generatedAt: new Date().toISOString(),
  git: {
    sha: git(["rev-parse", "HEAD"]),
    branch: git(["branch", "--show-current"]),
    exactTag: git(["describe", "--tags", "--exact-match"]),
  },
  build: {
    node: process.version,
    packageManager: "pnpm@10.6.0",
    lockfileSha256: createHash("sha256")
      .update(fs.readFileSync(path.join(root, "pnpm-lock.yaml")))
      .digest("hex"),
  },
  artifact: {
    imageDigest: process.env.CONTAINER_IMAGE_DIGEST || null,
    stagingUrl: process.env.STAGING_URL || null,
  },
  providers: {
    search: {
      configured: process.env.SEARCH_PROVIDER === "typesense",
      indexId: process.env.TYPESENSE_INDEX_ID || "static-local",
    },
    newsletter: {
      configured: process.env.KIT_ENABLED === "true" && Boolean(process.env.KIT_FORM_ID),
    },
    errorTracking: { configured: Boolean(process.env.GLITCHTIP_DSN) },
    cache: { configured: Boolean(process.env.VALKEY_URL) },
  },
  includedEvidence: copied.map(([source, destination]) => ({ source, destination })),
  pending,
};
fs.writeFileSync(path.join(bundleRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(
  `Created release evidence bundle ${path.relative(root, bundleRoot)} with ${Object.keys(hashes).length} hashed files.`,
);
