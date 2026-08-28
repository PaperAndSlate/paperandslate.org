import fs from "node:fs";
import path from "node:path";
import { validateWorkflowText } from "./workflow-policy";

const root = process.cwd();
const workflowRoots = [
  path.join(root, ".github", "workflows"),
  path.join(root, ".forgejo", "workflows"),
];

const files = workflowRoots.flatMap((directory) =>
  fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.(yaml|yml)$/i.test(entry.name))
    .map((entry) => path.join(directory, entry.name)),
);
const errors = files.flatMap((file) =>
  validateWorkflowText(
    fs.readFileSync(file, "utf8"),
    path.relative(root, file).replaceAll(path.sep, "/"),
  ),
);
if (errors.length > 0) throw new Error(`Workflow policy failed:\n- ${errors.join("\n- ")}`);
console.log(`Validated hosted workflow policy for ${files.length} GitHub/Forgejo workflows.`);
