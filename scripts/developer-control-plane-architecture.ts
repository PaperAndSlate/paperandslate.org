import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const packageRoot = path.join(root, "packages", "developer-control-plane");
const packageJson = JSON.parse(fs.readFileSync(path.join(packageRoot, "package.json"), "utf8")) as {
  dependencies?: Record<string, string>;
};

const expectedDependencies = {
  "better-auth": "1.7.2",
  pg: "8.23.0",
  uuid: "11.1.1",
};
for (const [name, version] of Object.entries(expectedDependencies)) {
  if (packageJson.dependencies?.[name] !== version)
    throw new Error(`DCP dependency ${name} must be pinned to ${version}`);
}
for (const forbidden of ["@better-auth/api-key", "unkey", "@unkey/api"])
  if (packageJson.dependencies?.[forbidden])
    throw new Error(`Forbidden DCP dependency: ${forbidden}`);

const sourceFiles = fs
  .readdirSync(path.join(packageRoot, "src"))
  .filter((file) => file.endsWith(".ts"))
  .map((file) => fs.readFileSync(path.join(packageRoot, "src", file), "utf8"))
  .join("\n");
for (const forbidden of [
  "@better-auth/api-key",
  'from "unkey',
  "fetch(",
  "node:http",
  "node:https",
  "projection_version",
  "key_projection_upserted",
  "hmac-sha256-v1",
])
  if (sourceFiles.includes(forbidden))
    throw new Error(`Forbidden DCP architecture surface: ${forbidden}`);

const auth = fs.readFileSync(path.join(packageRoot, "src", "auth.ts"), "utf8");
for (const required of [
  "cookieCache: { enabled: false }",
  "crossSubDomainCookies: { enabled: false }",
  "disableCSRFCheck: false",
  "disableOriginCheck: false",
  "plugins: [",
  "organization({",
])
  if (!auth.includes(required)) throw new Error(`Missing Better Auth control: ${required}`);

const env = fs.readFileSync(path.join(root, "packages", "config", "src", "env.ts"), "utf8");
for (const required of [
  'DCP_ENABLED: z.enum(["true", "false"]).default("false")',
  'DCP_FIXTURE_AUTH_ENABLED: z.enum(["true", "false"]).default("false")',
])
  if (!env.includes(required))
    throw new Error(`Missing disabled DCP environment default: ${required}`);

const protectedRouteDiff = fs
  .readdirSync(path.join(root, "apps", "web", "src", "app"), { recursive: true })
  .map(String)
  .filter((entry) => /auth|control|console|signup/i.test(entry));
if (protectedRouteDiff.length > 0)
  throw new Error(`DCP public route-like path exists: ${protectedRouteDiff.join(", ")}`);

const threatModel = fs.readFileSync(
  path.join(root, "docs", "security", "developer-control-plane-threat-model.md"),
  "utf8",
);
for (const boundary of [
  "browser/server",
  "server/PostgreSQL",
  "outbox/Data",
  "Tower/Infisical",
  "Telemetry",
])
  if (!threatModel.toLowerCase().includes(boundary.toLowerCase()))
    throw new Error(`Threat model missing boundary: ${boundary}`);

console.log("Developer Control Plane architecture controls verified.");
