import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const evidenceRoot = path.join(root, "evidence", "local", "security");
const skippedDirectories = new Set([
  ".git",
  ".next",
  ".turbo",
  "node_modules",
  "dist",
  "coverage",
  "plans",
  "docs/goals",
  ".generated",
  "evidence",
]);
const textExtensions = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".mjs",
  ".cjs",
  ".json",
  ".yml",
  ".yaml",
  ".md",
  ".css",
  ".html",
  ".toml",
  ".env",
  ".txt",
  ".sh",
]);
const textFileNames = new Set(["Dockerfile", ".dockerignore"]);
const sensitivePathPattern =
  /(^|\/)(?:\.env(?:\..*)?|.*(?:secret|credential|credentials|private[-_]?key).*(?:$|\/)|[^/]+\.(?:pem|key|p12|pfx))$/i;
const patterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/i,
  /\b(?:sk_live|rk_live|ghp_|github_pat_|xox[baprs]-)[A-Za-z0-9_-]{10,}/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\b(?:eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,})\b/,
  /\b(?:API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE_KEY)\s*[:=]\s*["'][^"'\r\n]{20,}["']/i,
];
const findings: Array<{ file: string; line: number; pattern: string }> = [];
const walk = (directory: string) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    const relative = path.relative(root, absolute).replaceAll(path.sep, "/");
    if (entry.isDirectory()) {
      if (!skippedDirectories.has(relative) && !skippedDirectories.has(entry.name)) walk(absolute);
      continue;
    }
    if (sensitivePathPattern.test(relative) && relative !== ".env.example") {
      findings.push({ file: relative, line: 1, pattern: "sensitive filename" });
      continue;
    }
    if (
      !textExtensions.has(path.extname(entry.name).toLowerCase()) &&
      !textFileNames.has(entry.name)
    )
      continue;
    const text = fs.readFileSync(absolute, "utf8");
    text.split(/\r?\n/).forEach((line, index) => {
      for (const pattern of patterns) {
        if (pattern.test(line)) {
          findings.push({ file: relative, line: index + 1, pattern: pattern.source });
          break;
        }
      }
    });
  }
};
walk(root);
fs.mkdirSync(evidenceRoot, { recursive: true });
const manifest = {
  status: findings.length === 0 ? "clean" : "findings",
  scannedAt: new Date().toISOString(),
  fileSet: "source-config-workflows-docs",
  findings,
  scanHash: createHash("sha256").update(JSON.stringify(findings)).digest("hex"),
};
fs.writeFileSync(
  path.join(evidenceRoot, "secret-scan.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
if (findings.length > 0)
  throw new Error(`Secret scan found ${findings.length} potential secret(s)`);
console.log("Secret scan passed with no high-confidence credential patterns.");
