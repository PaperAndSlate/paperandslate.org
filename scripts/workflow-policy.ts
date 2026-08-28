import YAML from "yaml";

type WorkflowObject = Record<string, unknown>;

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
      const reference = at >= 0 ? uses.slice(at + 1) : "";
      if (!/^[a-f0-9]{40}$/i.test(reference))
        errors.push(`${file}: action must use a full commit SHA: ${uses}`);
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
