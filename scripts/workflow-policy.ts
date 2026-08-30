import YAML from "yaml";

type WorkflowObject = Record<string, unknown>;

const verifiedActionPins: Record<string, string> = {
  "actions/checkout": "11bd71901bbe5b1630ceea73d27597364c9af683",
  "pnpm/action-setup": "7088e561eb65bb68695d245aa206f005ef30921d",
  "actions/setup-node": "49933ea5288caeca8642d1e84afbd3f7d6820020",
  "actions/upload-artifact": "ea165f8d65b6e75b540449e92b4886f43607fa02",
  "github/codeql-action/init": "0fa1882f994fbd81a47ab0804f93354f5ea40147",
  "github/codeql-action/analyze": "0fa1882f994fbd81a47ab0804f93354f5ea40147",
  "actions/dependency-review-action": "595b5aeba73380359d98a5e087f648dbb0edce1b",
  "https://code.forgejo.org/actions/upload-artifact": "c6a366c94c3e0affe28c06c8df20a878f24da3cf",
};

const visit = (value: unknown, callback: (object: WorkflowObject) => void) => {
  if (Array.isArray(value)) {
    for (const item of value) visit(item, callback);
    return;
  }
  if (!value || typeof value !== "object") return;
  const object = value as WorkflowObject;
  callback(object);
  for (const child of Object.values(object)) visit(child, callback);
};

function hasPullRequestTrigger(workflow: WorkflowObject) {
  const trigger = workflow.on;
  if (trigger === "pull_request") return true;
  if (Array.isArray(trigger)) return trigger.includes("pull_request");
  return Boolean(
    trigger &&
      typeof trigger === "object" &&
      !Array.isArray(trigger) &&
      Object.prototype.hasOwnProperty.call(trigger, "pull_request"),
  );
}

export function validateWorkflowText(text: string, file: string) {
  const errors: string[] = [];
  let parsed: WorkflowObject;
  try {
    parsed = (YAML.parse(text) ?? {}) as WorkflowObject;
  } catch (error) {
    return [
      `${file}: YAML parse failed: ${error instanceof Error ? error.message : String(error)}`,
    ];
  }

  const permissions = parsed.permissions;
  if (!permissions) errors.push(`${file}: top-level permissions are required`);
  else if (
    typeof permissions !== "object" ||
    Array.isArray(permissions) ||
    (permissions as WorkflowObject).contents !== "read"
  )
    errors.push(`${file}: top-level permissions must keep contents: read`);
  if (!parsed.concurrency) errors.push(`${file}: top-level concurrency is required`);
  const jobs = parsed.jobs;
  if (!jobs || typeof jobs !== "object" || Array.isArray(jobs)) {
    errors.push(`${file}: jobs are required`);
  } else {
    for (const [id, job] of Object.entries(jobs as WorkflowObject)) {
      if (!job || typeof job !== "object" || Array.isArray(job)) continue;
      if (!(job as WorkflowObject)["timeout-minutes"])
        errors.push(`${file}: job ${id} needs timeout-minutes`);
    }
  }

  if (/pull_request_target/i.test(text)) errors.push(`${file}: pull_request_target is forbidden`);
  if (/--no-sandbox/.test(text)) errors.push(`${file}: --no-sandbox is forbidden`);
  if (/shell\s*:\s*true/.test(text)) errors.push(`${file}: shell: true is forbidden`);

  if (
    /(^|[/\\])(lighthouse|quality)\.ya?ml$/i.test(file) &&
    /\.forgejo[/\\]workflows/i.test(file)
  ) {
    if (hasPullRequestTrigger(parsed))
      errors.push(
        `${file}: browser workflow must not run pull_request code on the persistent playwright runner; use a maintainer-controlled push or workflow_dispatch`,
      );
    const browserJobs =
      jobs && typeof jobs === "object" && !Array.isArray(jobs)
        ? Object.entries(jobs as WorkflowObject).filter(([, job]) => job && typeof job === "object")
        : [];
    for (const [id, job] of browserJobs) {
      if ((job as WorkflowObject)["runs-on"] !== "playwright")
        errors.push(`${file}: browser job ${id} must run on the playwright runner`);
      const jobEnv = (job as WorkflowObject).env;
      if (
        !jobEnv ||
        typeof jobEnv !== "object" ||
        Array.isArray(jobEnv) ||
        (jobEnv as WorkflowObject).CI_BROWSER_EXPECTED_USER !== "pwuser"
      )
        errors.push(`${file}: browser job ${id} must assert the pwuser runner identity`);
    }
  }

  visit(parsed, (object) => {
    const uses = object.uses;
    if (typeof uses === "string") {
      const at = uses.lastIndexOf("@");
      const action = at >= 0 ? uses.slice(0, at) : uses;
      const reference = at >= 0 ? uses.slice(at + 1) : "";
      if (!/^[a-f0-9]{40}$/i.test(reference))
        errors.push(`${file}: action must use a full commit SHA: ${uses}`);
      const verifiedPin = verifiedActionPins[action];
      if (verifiedPin && reference.toLowerCase() !== verifiedPin)
        errors.push(
          `${file}: ${action} must use verified commit ${verifiedPin}; found ${reference || "missing"}`,
        );
    }
    if (typeof uses === "string" && uses.includes("actions/checkout@")) {
      const withOptions = object.with;
      if (
        !withOptions ||
        typeof withOptions !== "object" ||
        Array.isArray(withOptions) ||
        (withOptions as WorkflowObject)["persist-credentials"] !== false
      )
        errors.push(`${file}: actions/checkout must set persist-credentials: false`);
    }
  });
  return errors;
}
