import { v7 as uuidv7 } from "uuid";
import type {
  ApiKeyMetadata,
  ApiKeyProvider,
  AuditAction,
  AuthorizedActor,
  ControlPlaneRepository,
  ControlPlaneTransaction,
  DcpReasonCode,
  MetricsPort,
  OutboxRecord,
  ProjectionTransport,
} from "./model";
import { DCP_REASON_CODES } from "./model";
import { authorizeProject } from "./rbac";
import { isFiniteNonNegativeInteger, revocationDeliveryState } from "./retention";

const ROTATION_OVERLAP_MS = 24 * 60 * 60 * 1_000;

export class DuplicateCommandError extends Error {
  readonly code = "DCP_COMMAND_ALREADY_PROCESSED";

  constructor() {
    super("This command has already completed; one-time material cannot be replayed");
    this.name = "DuplicateCommandError";
  }

  toJSON() {
    return { code: this.code, message: this.message };
  }
}

export class ControlPlaneStateError extends Error {
  readonly code = "DCP_STATE_INVALID";

  constructor() {
    super("The requested control-plane state is unavailable or invalid");
    this.name = "ControlPlaneStateError";
  }

  toJSON() {
    return { code: this.code, message: this.message };
  }
}

export class InvalidLifecycleInputError extends Error {
  readonly code = "DCP_LIFECYCLE_INPUT_INVALID";

  constructor() {
    super("The lifecycle command input is invalid");
    this.name = "InvalidLifecycleInputError";
  }

  toJSON() {
    return { code: this.code, message: this.message };
  }
}

export class OneTimeSecret {
  #value: string | null;

  constructor(value: string) {
    if (!value) throw new ControlPlaneStateError();
    this.#value = value;
  }

  consume() {
    if (this.#value === null) throw new ControlPlaneStateError();
    const value = this.#value;
    this.#value = null;
    return value;
  }

  toJSON() {
    return "[REDACTED]";
  }
}

export function isUuidV7(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  );
}

export function isDcpReasonCode(value: unknown): value is DcpReasonCode {
  return typeof value === "string" && (DCP_REASON_CODES as readonly string[]).includes(value);
}

function validateLifecycleInput(input: {
  commandId: unknown;
  correlationId: unknown;
  reasonCode?: unknown;
}) {
  if (!isUuidV7(input.commandId) || !isUuidV7(input.correlationId))
    throw new InvalidLifecycleInputError();
  if (input.reasonCode !== undefined && !isDcpReasonCode(input.reasonCode))
    throw new InvalidLifecycleInputError();
  return {
    commandId: input.commandId,
    correlationId: input.correlationId,
    reasonCode: input.reasonCode as DcpReasonCode | undefined,
  };
}

export const disabledProjectionTransport: ProjectionTransport = Object.freeze({
  enabled: false as const,
  async publish(): Promise<never> {
    throw new ControlPlaneStateError();
  },
});

export type SequenceDecision = "accept" | "duplicate" | "fail_closed";

export function evaluateProjectionSequence(input: {
  currentPolicyVersion: number;
  incomingPolicyVersion: number;
  eventVersionKnown: boolean;
  policyKnown: boolean;
  ageSeconds: number;
}): SequenceDecision {
  if (
    input.eventVersionKnown !== true ||
    input.policyKnown !== true ||
    !isFiniteNonNegativeInteger(input.currentPolicyVersion) ||
    !isFiniteNonNegativeInteger(input.incomingPolicyVersion) ||
    !isFiniteNonNegativeInteger(input.ageSeconds) ||
    input.ageSeconds >= 60 ||
    input.incomingPolicyVersion < input.currentPolicyVersion ||
    input.incomingPolicyVersion > input.currentPolicyVersion + 1
  )
    return "fail_closed";
  if (input.incomingPolicyVersion === input.currentPolicyVersion) return "duplicate";
  return "accept";
}

type ServiceOptions = {
  repository: ControlPlaneRepository;
  provider: ApiKeyProvider;
  metrics: MetricsPort;
  idFactory?: () => string;
};

export class DeveloperControlPlane {
  readonly #repository: ControlPlaneRepository;
  readonly #provider: ApiKeyProvider;
  readonly #metrics: MetricsPort;
  readonly #idFactory: () => string;

  constructor(options: ServiceOptions) {
    this.#repository = options.repository;
    this.#provider = options.provider;
    this.#metrics = options.metrics;
    this.#idFactory = options.idFactory ?? uuidv7;
  }

  async listKeys(input: { actor: AuthorizedActor; projectId: string }) {
    return this.#repository.transaction(async (transaction) => {
      const project = await transaction.getProject(input.projectId);
      if (!project) throw new ControlPlaneStateError();
      authorizeProject(input.actor, project, "key.list");
      return (await transaction.listKeys(project.id)).map((key) => ({ ...key }));
    });
  }

  async createKey(input: {
    actor: AuthorizedActor;
    projectId: string;
    commandId: string;
    correlationId: string;
    name: string;
    now: Date;
    expiresAt?: Date | null;
  }) {
    const command = validateLifecycleInput(input);
    return this.#repository.transaction(async (transaction) => {
      const project = await transaction.getProject(input.projectId);
      if (!project) throw new ControlPlaneStateError();
      authorizeProject(input.actor, project, "key.create", { requireFreshSession: true });
      await this.#assertNewCommand(transaction, command.commandId);
      const keyId = this.#nextId();
      const issued = await this.#provider.create({
        organizationId: project.organizationId,
        projectId: project.id,
        keyId,
        commandId: command.commandId,
      });
      const policyVersion = await transaction.nextPolicyVersion(project.organizationId);
      const metadata: ApiKeyMetadata = {
        id: keyId,
        organizationId: project.organizationId,
        projectId: project.id,
        providerKeyId: issued.providerKeyId,
        name: input.name,
        status: "active",
        createdAt: input.now,
        expiresAt: input.expiresAt ?? null,
        predecessorKeyId: null,
        overlapEndsAt: null,
        revokedAt: null,
        policyVersion,
      };
      await this.#commitLifecycle(transaction, {
        metadata,
        actor: input.actor,
        commandId: command.commandId,
        correlationId: command.correlationId,
        action: "key.created",
        now: input.now,
      });
      this.#metrics.record({ name: "dcp.lifecycle.result", value: 1, state: "ok" });
      return { metadata: { ...metadata }, reveal: new OneTimeSecret(issued.displayMaterial) };
    });
  }

  async rotateKey(input: {
    actor: AuthorizedActor;
    keyId: string;
    commandId: string;
    correlationId: string;
    now: Date;
  }) {
    const command = validateLifecycleInput(input);
    return this.#repository.transaction(async (transaction) => {
      const predecessor = await transaction.getKey(input.keyId);
      if (!predecessor || predecessor.status === "revoked") throw new ControlPlaneStateError();
      const project = await transaction.getProject(predecessor.projectId);
      if (!project) throw new ControlPlaneStateError();
      authorizeProject(input.actor, project, "key.rotate", { requireFreshSession: true });
      await this.#assertNewCommand(transaction, command.commandId);
      const replacementKeyId = this.#nextId();
      const issued = await this.#provider.rotate({
        organizationId: project.organizationId,
        projectId: project.id,
        predecessorKeyId: predecessor.id,
        replacementKeyId,
        commandId: command.commandId,
      });
      const policyVersion = await transaction.nextPolicyVersion(project.organizationId);
      predecessor.status = "rotating";
      predecessor.overlapEndsAt = new Date(input.now.getTime() + ROTATION_OVERLAP_MS);
      predecessor.policyVersion = policyVersion;
      await transaction.saveKey(predecessor);
      const replacement: ApiKeyMetadata = {
        id: replacementKeyId,
        organizationId: project.organizationId,
        projectId: project.id,
        providerKeyId: issued.providerKeyId,
        name: predecessor.name,
        status: "active",
        createdAt: input.now,
        expiresAt: predecessor.expiresAt,
        predecessorKeyId: predecessor.id,
        overlapEndsAt: null,
        revokedAt: null,
        policyVersion,
      };
      await this.#commitLifecycle(transaction, {
        metadata: replacement,
        actor: input.actor,
        commandId: command.commandId,
        correlationId: command.correlationId,
        action: "key.rotated",
        now: input.now,
      });
      this.#metrics.record({ name: "dcp.lifecycle.result", value: 1, state: "ok" });
      return {
        predecessor: { ...predecessor },
        replacement: { ...replacement },
        reveal: new OneTimeSecret(issued.displayMaterial),
      };
    });
  }

  async revokeKey(input: {
    actor: AuthorizedActor;
    keyId: string;
    commandId: string;
    correlationId: string;
    reasonCode: string;
    now: Date;
  }) {
    const command = validateLifecycleInput(input);
    return this.#repository.transaction(async (transaction) => {
      const metadata = await transaction.getKey(input.keyId);
      if (!metadata) throw new ControlPlaneStateError();
      const project = await transaction.getProject(metadata.projectId);
      if (!project) throw new ControlPlaneStateError();
      authorizeProject(input.actor, project, "key.revoke", { requireFreshSession: true });
      await this.#assertNewCommand(transaction, command.commandId);
      await this.#provider.revoke({
        organizationId: project.organizationId,
        projectId: project.id,
        keyId: metadata.id,
        providerKeyId: metadata.providerKeyId,
        commandId: command.commandId,
      });
      metadata.status = "revoked";
      metadata.revokedAt = input.now;
      metadata.overlapEndsAt = null;
      metadata.policyVersion = await transaction.nextPolicyVersion(project.organizationId);
      await this.#commitLifecycle(transaction, {
        metadata,
        actor: input.actor,
        commandId: command.commandId,
        correlationId: command.correlationId,
        action: "key.revoked",
        reasonCode: command.reasonCode,
        now: input.now,
      });
      const state = revocationDeliveryState(0);
      this.#metrics.record({ name: "dcp.revocation.delivery_age", value: 0, state });
      return { ...metadata };
    });
  }

  async #assertNewCommand(transaction: ControlPlaneTransaction, commandId: string) {
    if (await transaction.getIdempotency(commandId)) throw new DuplicateCommandError();
  }

  async #commitLifecycle(
    transaction: ControlPlaneTransaction,
    input: {
      metadata: ApiKeyMetadata;
      actor: AuthorizedActor;
      commandId: string;
      correlationId: string;
      action: AuditAction;
      reasonCode?: DcpReasonCode;
      now: Date;
    },
  ) {
    const auditId = this.#nextId();
    const outboxId = this.#nextId();
    await transaction.saveKey(input.metadata);
    await transaction.saveIdempotency({
      commandId: input.commandId,
      organizationId: input.metadata.organizationId,
      operation: input.action,
      resultKeyId: input.metadata.id,
      state: "completed",
      completedAt: input.now,
    });
    await transaction.appendAudit({
      id: auditId,
      organizationId: input.metadata.organizationId,
      projectId: input.metadata.projectId,
      keyId: input.metadata.id,
      actorId: input.actor.userId,
      action: input.action,
      result: "success",
      policyVersion: input.metadata.policyVersion,
      correlationId: input.correlationId,
      reasonCode: input.reasonCode ?? "requested",
      occurredAt: input.now,
    });
    const outbox: OutboxRecord = {
      id: outboxId,
      organizationId: input.metadata.organizationId,
      projectId: input.metadata.projectId,
      keyId: input.metadata.id,
      eventType: input.action,
      policyVersion: input.metadata.policyVersion,
      state: "pending",
      attemptCount: 0,
      occurredAt: input.now,
      acknowledgedAt: null,
      failedAt: null,
    };
    await transaction.appendOutbox(outbox);
  }

  #nextId() {
    const id = this.#idFactory();
    if (!isUuidV7(id)) throw new ControlPlaneStateError();
    return id;
  }
}

export { ROTATION_OVERLAP_MS };
