import { describe, expect, it } from "vitest";
import acceptanceManifest from "../docs/interfaces/fixtures/data-platform-api-key-projection-v3/acceptance-input-manifest.json";
import acknowledgementCases from "../docs/interfaces/fixtures/data-platform-api-key-projection-v3/wire-acknowledgement-cases.json";
import receiptSlots from "../docs/interfaces/fixtures/data-platform-api-key-projection-v3/external-receipt-slots.json";
import wireEvents from "../docs/interfaces/fixtures/data-platform-api-key-projection-v3/wire-event-cases.json";
import {
  canonicalDigest,
  canonicalizeJcs,
  validateAcceptanceInputBundle,
  validateAcknowledgementCases,
  validateReceiptSlots,
  validateRepositoryBoundaries,
  validateWireEventCases,
} from "../scripts/developer-control-plane-projection-v3-acceptance-input";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

describe("projection v3 acceptance-input bundle", () => {
  it("accepts the exact local provider-neutral bundle", () => {
    expect(validateAcceptanceInputBundle()).toEqual([]);
    expect(wireEvents.cases).toHaveLength(8);
    expect(acknowledgementCases.cases).toHaveLength(8);
    expect(receiptSlots.slots).toHaveLength(7);
    expect(wireEvents.cases.filter((item) => item.expected === "blocked_external")).toHaveLength(2);
    expect(wireEvents.cases.filter((item) => item.expected === "local_candidate")).toHaveLength(6);
    expect(acknowledgementCases.cases[0].expected).toBe("local_candidate");
    expect(acceptanceManifest.jointAcceptance).toBe(false);
    expect(acceptanceManifest.dcp1bAuthority).toBe(false);
  });

  it("revalidates the exact pre-commit repository boundary", () => {
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
});
