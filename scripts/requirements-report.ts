import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { readTowerEvidence, towerRequirementOverrides } from "./tower-evidence-import";

type Status =
  | "implemented"
  | "verified-local"
  | "verified-ci"
  | "verified-staging"
  | "partial"
  | "blocked-external"
  | "human-approval-pending"
  | "not-started"
  | "not-applicable";

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
  evidenceUpdatedAt: string;
};

type EvidenceOverride = Partial<
  Pick<
    Requirement,
    | "status"
    | "implementationFiles"
    | "tests"
    | "verificationCommands"
    | "generatedEvidence"
    | "externalDependencies"
    | "blocker"
    | "notes"
    | "evidenceUpdatedAt"
  >
>;

const root = process.cwd();
const planRoot = path.join(root, "plans");
const corePath = path.join(root, "config", "requirements-core.json");
const evidencePath = path.join(root, "config", "requirements-evidence.json");
const outputDir = path.join(root, ".generated", "requirements");
const outputJson = path.join(outputDir, "requirements.json");
const outputMarkdown = path.join(root, "IMPLEMENTATION_LEDGER.md");
const generatedAt = process.env.REQUIREMENTS_EVIDENCE_AT ?? new Date().toISOString();

function relative(file: string) {
  return path.relative(root, file).split(path.sep).join("/");
}

function hash(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex").slice(0, 16).toUpperCase();
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
        requirement:
          "Index-only traceability record for this planning source section; substantive acceptance is tracked by WEB-REQ records.",
        category: "traceability",
        priority: "P1",
        status: "not-applicable" as const,
        implementationFiles: [],
        tests: [],
        verificationCommands: ["pnpm requirements:check"],
        generatedEvidence: [
          ".generated/requirements/requirements.json",
          "IMPLEMENTATION_LEDGER.md",
        ],
        externalDependencies: [],
        blocker: null,
        notes:
          "Index-only row. It confirms that the planning source is represented, not that every action described by the section is complete.",
        evidenceUpdatedAt: generatedAt,
      }));
    });
}

function coreRequirements(): Requirement[] {
  const core = JSON.parse(fs.readFileSync(corePath, "utf8")) as Array<
    Partial<Requirement> & {
      id: string;
      source?: string;
      section?: string;
      requirement: string;
      category: string;
      priority: string;
      status: Status;
    }
  >;
  return core.map((item) => ({
    id: item.id,
    sourcePlanPath: item.sourcePlanPath ?? item.source ?? "config/requirements-core.json",
    sourceSection: item.sourceSection ?? item.section ?? item.id,
    requirement: item.requirement,
    category: item.category,
    priority: item.priority,
    status: item.status,
    implementationFiles: item.implementationFiles ?? [],
    tests: item.tests ?? [],
    verificationCommands: item.verificationCommands ?? [],
    generatedEvidence: item.generatedEvidence ?? [],
    externalDependencies: item.externalDependencies ?? [],
    blocker: item.blocker ?? null,
    notes: item.notes ?? null,
    evidenceUpdatedAt: item.evidenceUpdatedAt ?? generatedAt,
  }));
}

function evidenceOverrides() {
  if (!fs.existsSync(evidencePath)) return {} as Record<string, EvidenceOverride>;
  const parsed = JSON.parse(fs.readFileSync(evidencePath, "utf8")) as {
    records?: Record<string, EvidenceOverride>;
  };
  return parsed.records ?? {};
}

function applyEvidence(requirements: Requirement[]) {
  const overrides = evidenceOverrides();
  const towerOverrides = towerRequirementOverrides(readTowerEvidence());
  const known = new Set(requirements.map((item) => item.id));
  for (const id of Object.keys(overrides))
    if (!known.has(id)) throw new Error(`Evidence override references unknown requirement: ${id}`);
  for (const id of Object.keys(towerOverrides))
    if (!known.has(id)) throw new Error(`Tower evidence references unknown requirement: ${id}`);
  return requirements.map((item) => {
    const localOverride = overrides[item.id] ?? {};
    const towerOverride = towerOverrides[item.id] ?? {};
    const localEvidenceUpdatedAt = localOverride.evidenceUpdatedAt;
    const towerEvidenceUpdatedAt = towerOverride.evidenceUpdatedAt;
    return {
      ...item,
      ...localOverride,
      ...towerOverride,
      evidenceUpdatedAt:
        (typeof localEvidenceUpdatedAt === "string" ? localEvidenceUpdatedAt : undefined) ??
        (typeof towerEvidenceUpdatedAt === "string" ? towerEvidenceUpdatedAt : undefined) ??
        item.evidenceUpdatedAt ??
        generatedAt,
    };
  });
}

function escape(value: string | null) {
  return (value ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function markdown(requirements: Requirement[]) {
  const statuses = [
    "implemented",
    "verified-local",
    "verified-ci",
    "verified-staging",
    "partial",
    "blocked-external",
    "human-approval-pending",
    "not-started",
    "not-applicable",
  ] as const;
  const counts = Object.fromEntries(statuses.map((status) => [status, 0])) as Record<
    Status,
    number
  >;
  for (const requirement of requirements) counts[requirement.status] += 1;
  const rows = requirements
    .map(
      (item) =>
        `| ${item.id} | ${escape(item.sourcePlanPath)} | ${escape(item.sourceSection)} | ${escape(item.requirement)} | ${item.category} | ${item.priority} | ${item.status} | ${escape(item.implementationFiles.join(", "))} | ${escape(item.tests.join(", "))} | ${escape(item.verificationCommands.join(", "))} | ${escape(item.generatedEvidence.join(", "))} | ${escape(item.externalDependencies.join(", "))} | ${escape(item.blocker)} | ${escape(item.notes)} | ${item.evidenceUpdatedAt} |`,
    )
    .join("\n");
  return `# Implementation ledger

> Generated by \`pnpm requirements:check\` from \`config/requirements-core.json\`, \`config/requirements-evidence.json\`, the redacted \`config/tower-evidence.json\` receipt, and every Markdown section under \`plans/\`. Do not edit this table by hand.
>
> A plan-pack row is an index-only traceability record. It is deliberately \`not-applicable\` so that source representation cannot be mistaken for substantive implementation.

## Summary

- Generated at: ${generatedAt}
- Total records: ${requirements.length}
${statuses.map((status) => `- ${status}: ${counts[status]}`).join("\n")}

## Status vocabulary

- implemented: concrete implementation and evidence exist, but the check is not attributed to a specific automated environment.
- verified-local: the current workspace produced the cited implementation and check evidence.
- verified-ci: a CI run produced the cited evidence.
- verified-staging: an authorized staging deployment produced the cited evidence.
- partial: some implementation exists, but the acceptance bar is not complete.
- blocked-external: local work is complete as far as possible, but activation depends on external authority, credentials, or provider state.
- human-approval-pending: automated evidence exists, but a qualified or accountable human decision is still required.
- not-started: implementation or evidence is still required.
- not-applicable: explicitly scoped out or used only as an index row, with a written rationale.

## Records

| ID | Source plan | Section | Requirement | Category | Priority | Status | Implementation files | Tests | Verification commands | Generated evidence | External dependencies | Blocker | Notes | Evidence updated |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
${rows}
`;
}

function validate(requirements: Requirement[]) {
  const ids = new Set<string>();
  for (const item of requirements) {
    if (ids.has(item.id)) throw new Error(`Duplicate requirement ID: ${item.id}`);
    ids.add(item.id);
    if (item.id.startsWith("PLAN-REQ-")) {
      if (item.status !== "not-applicable")
        throw new Error(`Traceability row must be not-applicable: ${item.id}`);
      if (!item.requirement.startsWith("Index-only traceability record"))
        throw new Error(`Traceability row has substantive-looking wording: ${item.id}`);
      if (!item.notes) throw new Error(`Traceability row needs a rationale: ${item.id}`);
    }
    if (
      ["implemented", "verified-local", "verified-ci", "verified-staging"].includes(item.status)
    ) {
      if (item.implementationFiles.length === 0)
        throw new Error(`Verified requirement has no implementation files: ${item.id}`);
      if (item.tests.length === 0 && item.verificationCommands.length === 0)
        throw new Error(`Verified requirement has no tests or commands: ${item.id}`);
      if (item.generatedEvidence.length === 0)
        throw new Error(`Verified requirement has no evidence: ${item.id}`);
    }
    if (item.status === "blocked-external" || item.status === "human-approval-pending") {
      if (item.externalDependencies.length === 0 || !item.blocker)
        throw new Error(
          `Blocked or approval-pending requirement needs dependencies and blocker: ${item.id}`,
        );
    }
    if (item.status === "not-applicable" && !item.notes)
      throw new Error(`Not-applicable requirement needs a rationale: ${item.id}`);
    if (item.generatedEvidence.some((evidence) => evidence.includes("<release-id>")))
      throw new Error(`Requirement contains a placeholder evidence path: ${item.id}`);
  }
}

const requirements = applyEvidence([...coreRequirements(), ...sourceRequirements()]);
validate(requirements);
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(
  outputJson,
  `${JSON.stringify({ schemaVersion: 2, generatedAt, generatedBy: "pnpm requirements:check", requirements }, null, 2)}\n`,
);
fs.writeFileSync(outputMarkdown, markdown(requirements));
console.log(
  `Generated ${requirements.length} requirement records: ${requirements.filter((item) => item.category !== "traceability").length} substantive and ${requirements.filter((item) => item.category === "traceability").length} traceability-only.`,
);
