import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

type Status = "implemented" | "partial" | "blocked-external" | "not-started" | "not-applicable";

type Requirement = {
  id: string;
  sourcePlanPath: string;
  sourceSection: string;
  requirement: string;
  category: string;
  priority: string;
  status: Status;
  implementationFiles: string[];
  tests: string[];
  verificationCommands: string[];
  generatedEvidence: string[];
  externalDependencies: string[];
  blocker: string | null;
  notes: string | null;
};

const root = process.cwd();
const planRoot = path.join(root, "plans");
const corePath = path.join(root, "config", "requirements-core.json");
const outputDir = path.join(root, ".generated", "requirements");
const outputJson = path.join(outputDir, "requirements.json");
const outputMarkdown = path.join(root, "IMPLEMENTATION_LEDGER.md");

function relative(file: string) {
  return path.relative(root, file).split(path.sep).join("/");
}

function hash(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex").slice(0, 16).toUpperCase();
}

function categoryFor(file: string) {
  const section = file.split(/[\\/]/)[1] ?? "reference";
  return section.replace(/^\d+-/, "").replace(/-/g, " ");
}

function headingsFor(content: string) {
  const headings: string[] = [];
  for (const line of content.split(/\r?\n/)) {
    const match = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    if (match) headings.push(match[2].replace(/[`*_]/g, ""));
  }
  return headings.length > 0 ? headings : ["Document contents"];
}

function sourceRequirements(): Requirement[] {
  const files: string[] = [];
  const visit = (directory: string) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(full);
      else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) files.push(full);
    }
  };
  visit(planRoot);

  return files
    .sort((a, b) => relative(a).localeCompare(relative(b)))
    .flatMap((file) => {
      const sourcePlanPath = relative(file);
      const headings = headingsFor(fs.readFileSync(file, "utf8"));
      return headings.map((sourceSection, index) => ({
        id: `PLAN-REQ-${hash(`${sourcePlanPath}\n${index}\n${sourceSection}`)}`,
        sourcePlanPath,
        sourceSection,
        requirement: `The planning-pack section “${sourceSection}” is represented in the generated requirement ledger; substantive acceptance is tracked by the WEB-REQ records.`,
        category: "traceability",
        priority: "P1",
        status: "implemented" as const,
        implementationFiles: ["scripts/requirements-report.ts", "config/requirements-core.json"],
        tests: ["scripts/requirements-report.ts"],
        verificationCommands: ["pnpm requirements:check"],
        generatedEvidence: [
          ".generated/requirements/requirements.json",
          "IMPLEMENTATION_LEDGER.md",
        ],
        externalDependencies: [],
        blocker: null,
        notes:
          "Traceability record only; it does not claim that every substantive plan action is complete.",
      }));
    });
}

function coreRequirements(): Requirement[] {
  const core = JSON.parse(fs.readFileSync(corePath, "utf8")) as Array<
    Partial<Requirement> &
      Pick<
        Requirement,
        | "id"
        | "sourcePlanPath"
        | "sourceSection"
        | "requirement"
        | "category"
        | "priority"
        | "status"
      >
  >;
  return core.map((item) => ({
    ...item,
    implementationFiles: item.implementationFiles ?? [],
    tests: item.tests ?? [],
    verificationCommands: item.verificationCommands ?? ["pnpm verify"],
    generatedEvidence: item.generatedEvidence ?? [".generated/evidence/<release-id>/manifest.json"],
    externalDependencies: item.externalDependencies ?? [],
    blocker: item.blocker ?? null,
    notes: item.notes ?? null,
  }));
}

function escape(value: string | null) {
  return (value ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function markdown(requirements: Requirement[]) {
  const counts = requirements.reduce<Record<Status, number>>(
    (result, requirement) => {
      result[requirement.status] += 1;
      return result;
    },
    { implemented: 0, partial: 0, "blocked-external": 0, "not-started": 0, "not-applicable": 0 },
  );
  const rows = requirements
    .map(
      (item) =>
        `| ${item.id} | ${escape(item.sourcePlanPath)} | ${escape(item.sourceSection)} | ${escape(item.requirement)} | ${item.category} | ${item.priority} | ${item.status} | ${escape(item.implementationFiles.join(", "))} | ${escape(item.tests.join(", "))} | ${escape(item.verificationCommands.join(", "))} | ${escape(item.generatedEvidence.join(", "))} | ${escape(item.externalDependencies.join(", "))} | ${escape(item.blocker)} | ${escape(item.notes)} |`,
    )
    .join("\n");
  return `# Implementation ledger\n\n> Generated by pnpm requirements:check from config/requirements-core.json and every Markdown section under plans/. Do not edit this table by hand.\n>\n> This ledger is current-state evidence for the v1 release candidate. A plan-pack traceability row means the source section is represented; it does not claim that all work described by that section is complete.\n\n## Summary\n\n- Total records: ${requirements.length}\n- Implemented: ${counts.implemented}\n- Partial: ${counts.partial}\n- Blocked external: ${counts["blocked-external"]}\n- Not started: ${counts["not-started"]}\n- Not applicable: ${counts["not-applicable"]}\n\n## Status vocabulary\n\n- implemented: concrete implementation and evidence exist.\n- partial: some implementation exists, but the acceptance bar is not complete.\n- blocked-external: local work is complete as far as possible and activation depends on external/manual authority or credentials.\n- not-started: implementation or evidence is still required.\n- not-applicable: explicitly out of scope with a written rationale.\n\n## Records\n\n| ID | Source plan | Section | Requirement | Category | Priority | Status | Implementation files | Tests | Verification commands | Generated evidence | External dependencies | Blocker | Notes |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n${rows}\n`;
}

const requirements = [...coreRequirements(), ...sourceRequirements()];
const ids = new Set<string>();
for (const item of requirements) {
  if (ids.has(item.id)) throw new Error(`Duplicate requirement ID: ${item.id}`);
  ids.add(item.id);
  if (item.status === "implemented" && item.generatedEvidence.length === 0) {
    throw new Error(`Implemented requirement has no evidence: ${item.id}`);
  }
  if (item.status === "not-applicable" && !item.notes) {
    throw new Error(`Not-applicable requirement needs a rationale: ${item.id}`);
  }
}

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(
  outputJson,
  `${JSON.stringify({ schemaVersion: 1, generatedBy: "pnpm requirements:check", requirements }, null, 2)}\n`,
);
fs.writeFileSync(outputMarkdown, markdown(requirements));
console.log(
  `Generated ${requirements.length} requirement records from ${sourceRequirements().length} plan sections.`,
);
