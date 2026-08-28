import { describe, expect, it } from "vitest";
import { validateWorkflowText } from "../scripts/workflow-policy";

const valid = `
name: Valid
on: push
permissions:
  contents: read
concurrency:
  group: valid
jobs:
  check:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@0123456789abcdef0123456789abcdef01234567
        with:
          persist-credentials: false
`;

describe("hosted workflow policy", () => {
  it("accepts pinned, bounded workflows", () => {
    expect(validateWorkflowText(valid, "valid.yml")).toEqual([]);
  });

  it("rejects mutable actions and unsafe execution settings", () => {
    const errors = validateWorkflowText(
      valid
        .replace("@0123456789abcdef0123456789abcdef01234567", "@v4")
        .replace("timeout-minutes: 5", "shell: true"),
      "unsafe.yml",
    );
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining("full commit SHA"),
        expect.stringContaining("timeout-minutes"),
        expect.stringContaining("shell: true"),
      ]),
    );
  });

  it("checks flow-style action steps as well as block-style steps", () => {
    const errors = validateWorkflowText(
      valid.replace(
        "      - uses: actions/checkout@0123456789abcdef0123456789abcdef01234567\n        with:\n          persist-credentials: false",
        "      - { uses: actions/checkout@v4 }",
      ),
      "flow-style.yml",
    );
    expect(errors).toContain(
      "flow-style.yml: action must use a full commit SHA: actions/checkout@v4",
    );
    expect(errors).toContain(
      "flow-style.yml: actions/checkout must set persist-credentials: false",
    );
  });

  it("requires the Forgejo browser workflows to use the isolated pwuser runner", () => {
    const browserWorkflow = valid
      .replace("runs-on: ubuntu-latest", "runs-on: playwright")
      .replace("    steps:", "    env:\n      CI_BROWSER_EXPECTED_USER: pwuser\n    steps:");
    expect(validateWorkflowText(browserWorkflow, ".forgejo/workflows/quality.yml")).toEqual([]);
    expect(validateWorkflowText(valid, ".forgejo/workflows/quality.yml")).toEqual(
      expect.arrayContaining([
        expect.stringContaining("must run on the playwright runner"),
        expect.stringContaining("must assert the pwuser runner identity"),
      ]),
    );
  });
});
