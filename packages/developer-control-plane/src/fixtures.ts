import type {
  ApiKeyMetadata,
  ApiKeyProvider,
  AuditRecord,
  ControlPlaneRepository,
  ControlPlaneTransaction,
  DeveloperProject,
  IdempotencyRecord,
  MetricsPort,
  OutboxRecord,
  ProviderIssueResult,
} from "./model";

function clone<T>(value: T): T {
  return structuredClone(value);
}

export class DeterministicFixtureApiKeyProvider implements ApiKeyProvider {
  readonly kind = "test-fixture-only";
  readonly calls: string[] = [];
  #material: ProviderIssueResult[];

  constructor(input: { environment: "test"; material: ProviderIssueResult[] }) {
    if (input.environment !== "test" || input.material.some((item) => !item.displayMaterial))
      throw new Error("Fixture provider requires caller-supplied test material");
    this.#material = clone(input.material);
  }

  async create() {
    this.calls.push("create");
    return this.#take();
  }

  async rotate() {
    this.calls.push("rotate");
    return this.#take();
  }

  async revoke() {
    this.calls.push("revoke");
  }

  #take() {
    const next = this.#material.shift();
    if (!next) throw new Error("No caller-supplied fixture material remains");
    return clone(next);
  }
}

type FixtureState = {
  projects: Map<string, DeveloperProject>;
  keys: Map<string, ApiKeyMetadata>;
  idempotency: Map<string, IdempotencyRecord>;
  policyVersions: Map<string, number>;
  audits: AuditRecord[];
  outbox: OutboxRecord[];
};

function cloneState(state: FixtureState): FixtureState {
  return {
    projects: new Map([...state.projects].map(([key, value]) => [key, clone(value)])),
    keys: new Map([...state.keys].map(([key, value]) => [key, clone(value)])),
    idempotency: new Map([...state.idempotency].map(([key, value]) => [key, clone(value)])),
    policyVersions: new Map(state.policyVersions),
    audits: clone(state.audits),
    outbox: clone(state.outbox),
  };
}

export class InMemoryControlPlaneRepository implements ControlPlaneRepository {
  #state: FixtureState;

  constructor(projects: DeveloperProject[]) {
    this.#state = {
      projects: new Map(projects.map((project) => [project.id, clone(project)])),
      keys: new Map(),
      idempotency: new Map(),
      policyVersions: new Map(),
      audits: [],
      outbox: [],
    };
  }

  snapshot() {
    return cloneState(this.#state);
  }

  async transaction<T>(work: (transaction: ControlPlaneTransaction) => Promise<T>) {
    const candidate = cloneState(this.#state);
    const transaction: ControlPlaneTransaction = {
      getProject: async (projectId) => clone(candidate.projects.get(projectId) ?? null),
      getKey: async (keyId) => clone(candidate.keys.get(keyId) ?? null),
      listKeys: async (projectId) =>
        [...candidate.keys.values()].filter((key) => key.projectId === projectId).map(clone),
      getIdempotency: async (commandId) => clone(candidate.idempotency.get(commandId) ?? null),
      nextPolicyVersion: async (organizationId) => {
        const next = (candidate.policyVersions.get(organizationId) ?? 0) + 1;
        candidate.policyVersions.set(organizationId, next);
        return next;
      },
      saveKey: async (key) => {
        candidate.keys.set(key.id, clone(key));
      },
      saveIdempotency: async (record) => {
        candidate.idempotency.set(record.commandId, clone(record));
      },
      appendAudit: async (record) => {
        candidate.audits.push(clone(record));
      },
      appendOutbox: async (record) => {
        candidate.outbox.push(clone(record));
      },
    };
    const result = await work(transaction);
    this.#state = candidate;
    return result;
  }
}

export class CollectingMetrics implements MetricsPort {
  readonly records: Array<Parameters<MetricsPort["record"]>[0]> = [];

  record(input: Parameters<MetricsPort["record"]>[0]) {
    this.records.push(clone(input));
  }
}
