import fs from "node:fs";
import path from "node:path";
import { format } from "prettier";
import { describe, expect, it } from "vitest";
import { renderLedger, validate } from "../scripts/developer-control-plane-requirements";

const root = process.cwd();
const officialBetterAuthUrls = [
  "https://better-auth.com/docs/plugins/organization",
  "https://better-auth.com/docs/plugins/api-key",
  "https://better-auth.com/docs/plugins/api-key/reference",
];

const requirement = {
  id: "DCP-REQ-001",
  source: "plans/13-developer-control-plane/01-foundation-and-interface-contract.md",
  section: "Boundary",
  requirement: "DCP records planning only.",
  status: "verified-local" as const,
};

describe("Developer Control Plane requirements", () => {
  it("accepts an isolated DCP requirement", () => {
    expect(() => validate([requirement])).not.toThrow();
  });

  it("rejects invalid ids and unsafe source paths", () => {
    expect(() =>
      validate([
        {
          id: "WEB-REQ-001",
          source: "../outside.md",
          section: "Boundary",
          requirement: "DCP records planning only.",
          status: "verified-local",
        },
      ]),
    ).toThrow("Invalid DCP requirement id");
  });

  it("renders deterministic Prettier-compliant ledger output", async () => {
    const first = renderLedger([requirement]);
    const second = renderLedger([requirement]);

    expect(second).toBe(first);
    expect(await format(first, { parser: "markdown" })).toBe(first);
  });

  it("keeps the original visitor outcome inside Launch outcome before the DCP successor", () => {
    const executiveSummary = fs.readFileSync(
      path.join(root, "plans", "00-overview", "01-executive-summary.md"),
      "utf8",
    );
    const launchHeading = executiveSummary.indexOf("## Launch outcome");
    const visitorOutcome = executiveSummary.indexOf(
      "A visitor should leave with this clear understanding:",
    );
    const successorHeading = executiveSummary.indexOf(
      "## Successor: non-production Developer Control Plane",
    );

    expect(launchHeading).toBeGreaterThanOrEqual(0);
    expect(visitorOutcome).toBeGreaterThan(launchHeading);
    expect(successorHeading).toBeGreaterThan(visitorOutcome);
  });

  it("records official Better Auth references without selecting the API-key provider", () => {
    const sources = [
      path.join(
        root,
        "plans",
        "13-developer-control-plane",
        "01-foundation-and-interface-contract.md",
      ),
      path.join(
        root,
        "docs",
        "decisions",
        "ADR-0014-developer-control-plane-identity-and-api-key-ownership.md",
      ),
    ].map((file) => fs.readFileSync(file, "utf8"));
    const combined = sources.join("\n");

    for (const url of officialBetterAuthUrls) expect(combined).toContain(url);
    expect(combined).toContain("Provider selection remains pending");
    expect(combined).toContain("do not establish project binding");
  });

  it("tracks the DCP-1A kernel without advancing the API-key provider gate", () => {
    const parsed = JSON.parse(
      fs.readFileSync(
        path.join(root, "config", "developer-control-plane-requirements.json"),
        "utf8",
      ),
    ) as { requirements: Array<{ id: string; status: string }> };
    expect(parsed.requirements).toHaveLength(12);
    expect(parsed.requirements.filter((item) => item.status === "verified-local")).toHaveLength(11);
    expect(parsed.requirements.find((item) => item.id === "DCP-REQ-005")?.status).toBe(
      "not-started",
    );
    expect(parsed.requirements.map((item) => item.id)).toEqual(
      Array.from({ length: 12 }, (_, index) => `DCP-REQ-${String(index + 1).padStart(3, "0")}`),
    );
  });
});
