import fs from "node:fs";
import { describe, expect, it } from "vitest";
import acceptanceManifest from "../docs/interfaces/fixtures/data-platform-api-key-projection-v3/acceptance-input-manifest.json";
import acknowledgementCases from "../docs/interfaces/fixtures/data-platform-api-key-projection-v3/wire-acknowledgement-cases.json";
import receiptSlots from "../docs/interfaces/fixtures/data-platform-api-key-projection-v3/external-receipt-slots.json";
import wireEvents from "../docs/interfaces/fixtures/data-platform-api-key-projection-v3/wire-event-cases.json";
import {
  canonicalDigest,
  canonicalizeJcs,
  gitCommitObjectId,
  runOfflineCheck,
  N_IDENTITY,
  T027_IDENTITY,
  T023_IDENTITY,
  validateAcceptanceInputBundle,
  validateAcknowledgementCases,
  validateDataReviewHandoff,
  validateReceiptSlots,
  validateRepositoryBoundaries,
  validateRepositorySnapshot,
  validateWireEventCases,
  type RepositorySnapshot,
} from "../scripts/developer-control-plane-projection-v3-acceptance-input";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

const dataReviewHandoff = fs.readFileSync(
  "docs/interfaces/data-platform-api-key-projection-v3-data-review-handoff.md",
  "utf8",
);

function assertFrozenReceiptSlotAndAggregateMutationsReject(): void {
  const mutations: Array<[string, (value: any) => void]> = [
    ["schema version", (value) => (value.schemaVersion = "2.0.0")],
    ["collection", (value) => (value.collection = "other")],
    ["classification", (value) => (value.classification = "accepted")],
    ["contract status", (value) => (value.contractStatus = "accepted")],
    ["aggregate status", (value) => (value.aggregate.status = "accepted")],
    ["joint acceptance", (value) => (value.aggregate.jointAcceptance = true)],
    ["DCP-1B authority", (value) => (value.aggregate.dcp1bAuthority = true)],
    ["positive vectors", (value) => (value.aggregate.positiveVerifierVectors = "local_candidate")],
    ["slot order", (value) => value.slots.reverse()],
    ["slot status", (value) => (value.slots[0].status = "approved")],
    ["slot owner", (value) => (value.slots[0].owner = "Attacker")],
    ["slot evidence", (value) => (value.slots[0].requiredEvidence[0] = "changed")],
    ["slot identity binding", (value) => (value.slots[0].identityBinding = "changed")],
    ["slot acceptance owner", (value) => (value.slots[0].acceptanceOwner = "Attacker")],
    ["authority denials", (value) => (value.authorityDenials[0] = "allow-provider")],
    ["extra root field", (value) => (value.extra = true)],
  ];
  for (const [_label, mutate] of mutations) {
    const mutated = clone(receiptSlots) as any;
    mutate(mutated);
    expect(validateReceiptSlots(mutated)).not.toEqual([]);
  }
}

function acceptedPostNSnapshot(): RepositorySnapshot {
  const headTree = "1".repeat(40);
  const rawCommit =
    "tree " +
    headTree +
    "\nparent " +
    N_IDENTITY.commit +
    "\nauthor Test User <test@example.invalid> 0 +0000\ncommitter Test User <test@example.invalid> 0 +0000\n\nrepair\n";
  const head = gitCommitObjectId(rawCommit);
  return {
    head,
    headType: "commit",
    headTree,
    headParent: N_IDENTITY.commit,
    headSecondParent: null,
    headCommitObjectHash: head,
    headCommitTree: headTree,
    headCommitParents: [N_IDENTITY.commit],
    ancestryCount: 1,
    nTree: N_IDENTITY.tree,
    branch: "release/v1-closure",
    originUrl: "https://git.tower/callum/paperandslate-web.git",
    originReleaseRef: "a32604004cbfeeb90e7c114a9c369834bc3bcfa3",
    stagedPaths: [],
    tagsAtHead: [],
    diffPaths: [
      "docs/interfaces/data-platform-api-key-projection-v3-data-review-handoff.md",
      "scripts/developer-control-plane-projection-v3-acceptance-input.ts",
      "tests/developer-control-plane-projection-v3-acceptance-input.test.ts",
    ],
    baseDiffPaths: [
      "docs/interfaces/data-platform-api-key-projection-v3-acceptance-input.schema.json",
      "docs/interfaces/fixtures/data-platform-api-key-projection-v3/acceptance-input-manifest.json",
      "docs/interfaces/fixtures/data-platform-api-key-projection-v3/wire-event-cases.json",
      "docs/interfaces/fixtures/data-platform-api-key-projection-v3/wire-acknowledgement-cases.json",
      "docs/interfaces/fixtures/data-platform-api-key-projection-v3/external-receipt-slots.json",
      "docs/interfaces/data-platform-api-key-projection-v3-data-review-handoff.md",
      "scripts/developer-control-plane-projection-v3-acceptance-input.ts",
      "tests/developer-control-plane-projection-v3-acceptance-input.test.ts",
    ],
  };
}

describe("projection v3 acceptance-input bundle", () => {
  it("accepts the exact local provider-neutral bundle", () => {
    expect(validateAcceptanceInputBundle()).toEqual([]);
    expect(validateDataReviewHandoff(dataReviewHandoff)).toEqual([]);
    expect(wireEvents.cases).toHaveLength(8);
    expect(acknowledgementCases.cases).toHaveLength(8);
    expect(receiptSlots.slots).toHaveLength(7);
    expect(wireEvents.cases.filter((item) => item.expected === "blocked_external")).toHaveLength(2);
    expect(wireEvents.cases.filter((item) => item.expected === "local_candidate")).toHaveLength(6);
    expect(acknowledgementCases.cases[0].expected).toBe("local_candidate");
    expect(acceptanceManifest.jointAcceptance).toBe(false);
    expect(acceptanceManifest.dcp1bAuthority).toBe(false);
  });

  it("revalidates the exact post-N repair boundary", () => {
    expect(validateRepositoryBoundaries()).toEqual([]);
  });

  it("uses the RFC 8785 number and UTF-8 JSON value rules for the closed fixture domain", () => {
    expect(canonicalizeJcs({ b: 2, a: 1 })).toBe('{"a":1,"b":2}');
    expect(canonicalizeJcs(333333333.33333329)).toBe("333333333.3333333");
    expect(canonicalizeJcs(1e30)).toBe("1e+30");
    expect(canonicalizeJcs(0.002)).toBe("0.002");
    expect(canonicalizeJcs(-0)).toBe("0");
    expect(canonicalizeJcs({ "€": "\r" })).toBe('{"€":"\\r"}');
    expect(() => canonicalizeJcs(Number.NaN)).toThrow("non-finite number");
    expect(() => canonicalizeJcs(Number.POSITIVE_INFINITY)).toThrow("non-finite number");
    expect(() => canonicalizeJcs("\ud800")).toThrow("unpaired surrogate");
    expect(() => canonicalizeJcs({ ["\ud800"]: "value" })).toThrow("property name");
    expect(() => canonicalizeJcs({ nested: { ["\udc00"]: "value" } })).toThrow("property name");
  });

  it("binds every supplied event and acknowledgement digest to canonical bytes", () => {
    for (const item of wireEvents.cases) {
      expect(item.canonicalBytes).toBe(canonicalizeJcs(item.event));
      expect(item.canonicalDigest).toBe(canonicalDigest(item.event));
    }
    const applied = acknowledgementCases.cases[0];
    expect(applied.acknowledgement).not.toBeNull();
    expect(applied.canonicalBytes).toBe(canonicalizeJcs(applied.acknowledgement));
    expect(applied.canonicalDigest).toBe(canonicalDigest(applied.acknowledgement));
  });

  it.each([
    ["extra envelope field", (value: any) => (value.cases[0].event.extra = true)],
    [
      "different event case",
      (value: any) => (value.cases[0].event.event_type = "KEY.VERIFIER_PUBLISHED"),
    ],
    ["fractional event counter", (value: any) => (value.cases[0].event.policy_version = 1.5)],
    [
      "non-finite event counter",
      (value: any) => (value.cases[0].event.organization_sequence = Number.POSITIVE_INFINITY),
    ],
    [
      "reversed scopes",
      (value: any) => (value.cases[3].event.payload.scopes = ["provenance:read", "data:read"]),
    ],
    ["admin write scope", (value: any) => (value.cases[0].event.payload.scopes = ["admin:write"])],
    ["extra revoked payload", (value: any) => (value.cases[2].event.payload.reason = "sentinel")],
    [
      "blocked descriptor object",
      (value: any) => (value.cases[0].event.payload.verifier = { status: "unbound" }),
    ],
    ["changed canonical bytes", (value: any) => (value.cases[0].canonicalBytes += " ")],
    [
      "changed canonical digest",
      (value: any) =>
        (value.cases[0].canonicalDigest = value.cases[0].canonicalDigest.toUpperCase()),
    ],
  ])("rejects a hostile wire-event mutation: %s", (_label, mutate) => {
    const mutated = clone(wireEvents) as any;
    mutate(mutated);
    expect(validateWireEventCases(mutated)).not.toEqual([]);
  });

  it("rejects descriptor activation, provider material, and recomputed canonical evidence", () => {
    for (const field of ["client_secret", "key_ref", "material"]) {
      const mutated = clone(wireEvents) as any;
      const item = mutated.cases[0];
      item.expected = "local_candidate";
      item.blockedReason = null;
      item.event.payload.verifier = { [field]: "provider-secret-sentinel" };
      item.canonicalBytes = canonicalizeJcs(item.event);
      item.canonicalDigest = canonicalDigest(item.event);
      expect(validateWireEventCases(mutated)).not.toEqual([]);
    }
  });

  it.each([
    ["extra acknowledgement field", (value: any) => (value.cases[0].acknowledgement.extra = true)],
    [
      "applied reason code",
      (value: any) => (value.cases[0].acknowledgement.reason_code = "unexpected"),
    ],
    [
      "non-finite acknowledgement sequence",
      (value: any) => (value.cases[0].acknowledgement.organization_sequence = Number.NaN),
    ],
    [
      "changed event digest",
      (value: any) =>
        (value.cases[0].acknowledgement.canonical_event_digest = "sha256:" + "0".repeat(64)),
    ],
    ["changed acknowledgement bytes", (value: any) => (value.cases[0].canonicalBytes = "{}")],
  ])("rejects a hostile acknowledgement mutation: %s", (_label, mutate) => {
    const mutated = clone(acknowledgementCases) as any;
    mutate(mutated);
    expect(validateAcknowledgementCases(mutated)).not.toEqual([]);
  });

  it.each([
    ["approved provider slot", (value: any) => (value.slots[1].status = "approved")],
    ["aggregate accepted", (value: any) => (value.aggregate.jointAcceptance = true)],
    [
      "live secret sentinel",
      (value: any) => value.slots[0].requiredEvidence.push("Bearer live-secret-sentinel"),
    ],
  ])("rejects a hostile external-receipt mutation: %s", (_label, mutate) => {
    const mutated = clone(receiptSlots) as any;
    mutate(mutated);
    expect(validateReceiptSlots(mutated)).not.toEqual([]);
    if (_label === "approved provider slot") {
      assertFrozenReceiptSlotAndAggregateMutationsReject();
    }
  });

  it("accepts only a self-consistent direct child of N and checks identity first", () => {
    const accepted = acceptedPostNSnapshot();
    expect(validateRepositorySnapshot(accepted)).toEqual([]);
    let bundleLoaded = false;
    expect(
      runOfflineCheck({ ...accepted, head: N_IDENTITY.commit }, () => {
        bundleLoaded = true;
        throw new Error("bundle must not load");
      }),
    ).not.toEqual([]);
    expect(bundleLoaded).toBe(false);

    const mutations: Array<[string, (value: RepositorySnapshot) => void]> = [
      ["tree", (value) => (value.headTree = "2".repeat(40))],
      ["parent", (value) => (value.headParent = T027_IDENTITY.commit)],
      ["second parent", (value) => (value.headSecondParent = T023_IDENTITY.commit)],
      ["ancestry", (value) => (value.ancestryCount = 2)],
      ["raw object hash", (value) => (value.headCommitObjectHash = "3".repeat(40))],
      ["raw commit tree", (value) => (value.headCommitTree = "4".repeat(40))],
      [
        "raw commit parents",
        (value) => (value.headCommitParents = [N_IDENTITY.commit, T023_IDENTITY.commit]),
      ],
      ["branch", (value) => (value.branch = "main")],
      ["origin", (value) => (value.originUrl = "https://example.invalid/repo.git")],
      ["origin ref", (value) => (value.originReleaseRef = N_IDENTITY.commit)],
      [
        "index",
        (value) => {
          value.stagedPaths = ["unexpected"];
        },
      ],
      [
        "tag",
        (value) => {
          value.tagsAtHead = ["v3"];
        },
      ],
      [
        "diff",
        (value) => {
          value.diffPaths = ["scripts/developer-control-plane-projection-v3-acceptance-input.ts"];
        },
      ],
      [
        "aggregate diff",
        (value) => {
          value.baseDiffPaths = [
            "scripts/developer-control-plane-projection-v3-acceptance-input.ts",
          ];
        },
      ],
    ];
    for (const [_label, mutate] of mutations) {
      const mutated = clone(accepted);
      mutate(mutated);
      expect(validateRepositorySnapshot(mutated)).not.toEqual([]);
    }
  });

  it("retains provider-neutral and external-gate denials in serialized artifacts", () => {
    const serialized = JSON.stringify({
      acceptanceManifest,
      wireEvents,
      acknowledgementCases,
      receiptSlots,
    });
    expect(serialized).not.toMatch(
      /hmac-sha256-v1|fixture[-_ ]?key[-_ ]?ref|Bearer\s+\S+|live[-_ ]?secret[-_ ]?sentinel/i,
    );
    expect(acceptanceManifest.authorityDenials).toContain("no-final-verifier-scheme");
    expect(receiptSlots.aggregate.positiveVerifierVectors).toBe("blocked_external");
    expect(receiptSlots.aggregate.jointAcceptance).toBe(false);
  });

  it.each([
    ["fixture evidence status", (value: any) => (value.fixtureEvidence.status = "accepted")],
    [
      "fixture evidence identity",
      (value: any) =>
        (value.fixtureEvidence.identityBoundary.t027Reconciliation.tree = "0".repeat(40)),
    ],
    [
      "joint case reference",
      (value: any) => (value.fixtureEvidence.boundaryFixtures[0].sourceCaseId = "missing"),
    ],
  ])("rejects a hostile fixture-evidence mutation: %s", (_label, mutate) => {
    const mutated = clone(acceptanceManifest) as any;
    mutate(mutated);
    expect(validateAcceptanceInputBundle({ manifest: mutated })).not.toEqual([]);
  });

  it.each([
    [
      "malformed tree length",
      (value: string) =>
        value.replace(
          "5c3a56a25f4eb374e94550f89b9ed1dbd52bb66a`",
          "5c3a56a25f4eb374e94550f89b9ed1dbd52bb66a3`",
        ),
    ],
    [
      "trailing tree characters",
      (value: string) =>
        value.replace(
          "5c3a56a25f4eb374e94550f89b9ed1dbd52bb66a`",
          "5c3a56a25f4eb374e94550f89b9ed1dbd52bb66a-suffix`",
        ),
    ],
    [
      "drifted commit",
      (value: string) =>
        value.replace("d21efabb8550578333fee5f62bf0e822fbca1394`", "0".repeat(40) + "`"),
    ],
    [
      "drifted tree",
      (value: string) =>
        value.replace("5c3a56a25f4eb374e94550f89b9ed1dbd52bb66a`", "1".repeat(40) + "`"),
    ],
    [
      "tree trailing character outside code span",
      (value: string) =>
        value.replace(
          "5c3a56a25f4eb374e94550f89b9ed1dbd52bb66a`.",
          "5c3a56a25f4eb374e94550f89b9ed1dbd52bb66a`x.",
        ),
    ],
  ])("rejects a hostile Data T681 handoff mutation: %s", (_label, mutate) => {
    expect(validateDataReviewHandoff(mutate(dataReviewHandoff))).not.toEqual([]);
  });
});
