import type { OutboxRecord } from "./model";

export const DCP_RETENTION_DAYS = {
  audit: 400,
  outboxAcknowledged: 30,
  outboxFailed: 90,
  idempotency: 30,
} as const;

export const DCP_REVOCATION_THRESHOLDS_SECONDS = {
  warning: 30,
  critical: 45,
  failClosed: 60,
} as const;

export function isFiniteNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

export function revocationDeliveryState(ageSeconds: number) {
  if (
    !isFiniteNonNegativeInteger(ageSeconds) ||
    ageSeconds >= DCP_REVOCATION_THRESHOLDS_SECONDS.failClosed
  )
    return "fail_closed" as const;
  if (ageSeconds >= DCP_REVOCATION_THRESHOLDS_SECONDS.critical) return "critical" as const;
  if (ageSeconds >= DCP_REVOCATION_THRESHOLDS_SECONDS.warning) return "warning" as const;
  return "ok" as const;
}

export function outboxPurgeEligible(input: {
  record: OutboxRecord;
  now: Date;
  legalHold: boolean;
  activeIncident: boolean;
}) {
  if (input.legalHold || input.activeIncident || input.record.state === "pending") return false;
  const reference =
    input.record.state === "acknowledged" ? input.record.acknowledgedAt : input.record.failedAt;
  if (!reference) return false;
  const days =
    input.record.state === "acknowledged"
      ? DCP_RETENTION_DAYS.outboxAcknowledged
      : DCP_RETENTION_DAYS.outboxFailed;
  return input.now.getTime() - reference.getTime() >= days * 24 * 60 * 60 * 1_000;
}
