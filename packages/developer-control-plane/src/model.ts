export type OrganizationRole = "owner" | "admin" | "developer" | "read_only_analyst";

export const DCP_REASON_CODES = [
  "requested",
  "owner-request",
  "security-incident",
  "compromised",
  "expired",
  "administrative",
] as const;

export type DcpReasonCode = (typeof DCP_REASON_CODES)[number];

export type OrganizationMembership = {
  userId: string;
  organizationId: string;
  role: OrganizationRole;
};

export type AuthorizedActor = OrganizationMembership & {
  sessionId: string;
  sessionFresh: boolean;
};

export type DeveloperProject = {
  id: string;
  organizationId: string;
  name: string;
  status: "active" | "disabled";
  createdAt: Date;
};

export type ApiKeyStatus = "active" | "rotating" | "revoked";

export type ApiKeyMetadata = {
  id: string;
  organizationId: string;
  projectId: string;
  providerKeyId: string;
  name: string;
  status: ApiKeyStatus;
  createdAt: Date;
  expiresAt: Date | null;
  predecessorKeyId: string | null;
  overlapEndsAt: Date | null;
  revokedAt: Date | null;
  policyVersion: number;
};

export type AuditAction = "key.created" | "key.rotated" | "key.revoked";

export type AuditRecord = {
  id: string;
  organizationId: string;
  projectId: string;
  keyId: string;
  actorId: string;
  action: AuditAction;
  result: "success" | "denied" | "failed";
  policyVersion: number;
  correlationId: string;
  reasonCode: DcpReasonCode;
  occurredAt: Date;
};

export type OutboxState = "pending" | "failed" | "acknowledged";

export type OutboxRecord = {
  id: string;
  organizationId: string;
  projectId: string;
  keyId: string;
  eventType: AuditAction;
  policyVersion: number;
  state: OutboxState;
  attemptCount: number;
  occurredAt: Date;
  acknowledgedAt: Date | null;
  failedAt: Date | null;
};

export type IdempotencyRecord = {
  commandId: string;
  organizationId: string;
  operation: AuditAction;
  resultKeyId: string;
  state: "completed";
  completedAt: Date;
};

export type ProviderIssueResult = {
  providerKeyId: string;
  displayMaterial: string;
};

export interface ApiKeyProvider {
  readonly kind: string;
  create(input: {
    organizationId: string;
    projectId: string;
    keyId: string;
    commandId: string;
  }): Promise<ProviderIssueResult>;
  rotate(input: {
    organizationId: string;
    projectId: string;
    predecessorKeyId: string;
    replacementKeyId: string;
    commandId: string;
  }): Promise<ProviderIssueResult>;
  revoke(input: {
    organizationId: string;
    projectId: string;
    keyId: string;
    providerKeyId: string;
    commandId: string;
  }): Promise<void>;
}

export interface ControlPlaneTransaction {
  getProject(projectId: string): Promise<DeveloperProject | null>;
  getKey(keyId: string): Promise<ApiKeyMetadata | null>;
  listKeys(projectId: string): Promise<ApiKeyMetadata[]>;
  getIdempotency(commandId: string): Promise<IdempotencyRecord | null>;
  nextPolicyVersion(organizationId: string): Promise<number>;
  saveKey(key: ApiKeyMetadata): Promise<void>;
  saveIdempotency(record: IdempotencyRecord): Promise<void>;
  appendAudit(record: AuditRecord): Promise<void>;
  appendOutbox(record: OutboxRecord): Promise<void>;
}

export interface ControlPlaneRepository {
  transaction<T>(work: (transaction: ControlPlaneTransaction) => Promise<T>): Promise<T>;
}

export interface MetricsPort {
  record(input: {
    name: "dcp.lifecycle.result" | "dcp.revocation.delivery_age" | "dcp.outbox.state";
    value: number;
    state: "ok" | "warning" | "critical" | "fail_closed" | "failed";
  }): void;
}

export interface ProjectionTransport {
  readonly enabled: false;
  publish(): Promise<never>;
}
