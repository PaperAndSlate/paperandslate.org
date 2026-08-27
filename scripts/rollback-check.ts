import fs from "node:fs";
import YAML from "yaml";

const rollback = YAML.parse(fs.readFileSync("config/rollback.yml", "utf8")) as {
  version?: number;
  strategy?: string;
  steps?: string[];
  activation?: string;
};
if (rollback.version !== 1 || rollback.strategy !== "immutable-artifact-redeploy")
  throw new Error("Rollback policy must use immutable artifact redeploy");
const requiredSteps = [
  "stop-current-release",
  "redeploy-last-known-good-artifact",
  "verify-health-and-static-routes",
];
if (!requiredSteps.every((step) => rollback.steps?.includes(step)))
  throw new Error("Rollback policy is missing a health-gated redeploy step");
if (rollback.activation !== "pending" && rollback.activation !== "verified")
  throw new Error("Rollback policy must declare activation state");
for (const file of ["docs/reports/rollback-plan.md", "infrastructure/tower/intent.yaml"]) {
  if (!fs.existsSync(file)) throw new Error(`Missing rollback artifact: ${file}`);
}
console.log(`Validated immutable rollback policy (${rollback.activation}).`);
