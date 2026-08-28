import path from "node:path";

export type TraceabilityStatus =
  | "implemented"
  | "verified-local"
  | "verified-ci"
  | "verified-staging"
  | "partial"
  | "blocked-external"
  | "human-approval-pending"
  | "not-started"
  | "not-applicable";

export type TraceabilityRecord = {
  id?: unknown;
  sourcePlanPath?: unknown;
  sourceSection?: unknown;
  requirement?: unknown;
  category?: unknown;
  priority?: unknown;
  status?: unknown;
  implementationFiles?: unknown;
  tests?: unknown;
  verificationCommands?: unknown;
  generatedEvidence?: unknown;
  externalDependencies?: unknown;
  blocker?: unknown;
  notes?: unknown;
};

const statuses = new Set<TraceabilityStatus>([
  "implemented",
  "verified-local",
  "verified-ci",
  "verified-staging",
  "partial",
  "blocked-external",
  "human-approval-pending",
  "not-started",
  "not-applicable",
]);
const verifiedStatuses = new Set<TraceabilityStatus>([
  "implemented",
  "verified-local",
  "verified-ci",
  "verified-staging",
]);

function list(value: unknown): string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string") ? value : [];
}

function isSafeRelativePath(value: string, root: string) {
  if (!value || path.isAbsolute(value)) return false;
  const resolvedRoot = path.resolve(root);
  const resolved = path.resolve(resolvedRoot, value);
  return resolved === resolvedRoot || resolved.startsWith(`${resolvedRoot}${path.sep}`);
}

export function validateTraceability(
  records: TraceabilityRecord[],
  planFiles: readonly string[],
  root: string,
): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const knownPlans = new Set(planFiles);
  const mappedPlans = new Set<string>();

  for (const record of records) {
    const id = typeof record.id === "string" ? record.id : "";
    if (!id) {
      errors.push("requirement record has no string id");
      continue;
    }
    if (ids.has(id)) errors.push(`duplicate requirement ID: ${id}`);
    ids.add(id);

    const sourcePlanPath = typeof record.sourcePlanPath === "string" ? record.sourcePlanPath : "";
    const sourceSection = typeof record.sourceSection === "string" ? record.sourceSection : "";
    const requirement = typeof record.requirement === "string" ? record.requirement : "";
    const status = record.status;
    if (!sourcePlanPath || !sourceSection || !requirement)
      errors.push(`${id} is missing sourcePlanPath, sourceSection, or requirement`);
    if (typeof status !== "string" || !statuses.has(status as TraceabilityStatus))
      errors.push(`${id} has an invalid status: ${String(status)}`);

    if (sourcePlanPath.startsWith("plans/")) {
      if (!knownPlans.has(sourcePlanPath))
        errors.push(`${id} references missing plan: ${sourcePlanPath}`);
      if (id.startsWith("PLAN-REQ-")) mappedPlans.add(sourcePlanPath);
    }

    const implementationFiles = list(record.implementationFiles);
    const tests = list(record.tests);
    const verificationCommands = list(record.verificationCommands);
    const generatedEvidence = list(record.generatedEvidence);
    for (const field of ["implementationFiles", "tests", "generatedEvidence"] as const) {
      const values = list(record[field]);
      if (record[field] !== undefined && !Array.isArray(record[field]))
        errors.push(`${id}.${field} must be an array of strings`);
      for (const value of values)
        if (!isSafeRelativePath(value, root))
          errors.push(`${id}.${field} escapes the repository: ${value}`);
    }

    if (id.startsWith("PLAN-REQ-")) {
      if (status !== "not-applicable") errors.push(`${id} plan index row must be not-applicable`);
      if (!requirement.startsWith("Index-only traceability record"))
        errors.push(`${id} plan index row has substantive-looking wording`);
      if (typeof record.notes !== "string" || !record.notes.trim())
        errors.push(`${id} plan index row needs a rationale`);
    }

    if (typeof status === "string" && verifiedStatuses.has(status as TraceabilityStatus)) {
      if (implementationFiles.length === 0)
        errors.push(`${id} verified status has no implementation files`);
      if (tests.length === 0 && verificationCommands.length === 0)
        errors.push(`${id} verified status has no tests or verification commands`);
      if (generatedEvidence.length === 0)
        errors.push(`${id} verified status has no generated evidence`);
    }
    if (status === "blocked-external" || status === "human-approval-pending") {
      if (
        list(record.externalDependencies).length === 0 ||
        typeof record.blocker !== "string" ||
        !record.blocker
      )
        errors.push(`${id} blocked status needs externalDependencies and blocker`);
    }
    if (status === "not-applicable" && (typeof record.notes !== "string" || !record.notes.trim()))
      errors.push(`${id} not-applicable status needs a rationale`);
  }

  for (const planFile of planFiles) {
    if (!mappedPlans.has(planFile))
      errors.push(`plan file is not mapped by a PLAN-REQ row: ${planFile}`);
  }
  return errors;
}
