export type StandardsQuery = {
  q?: string;
  jurisdiction?: string;
  stage?: string;
  subject?: string;
  release?: string;
  cursor?: string;
};

export type StandardsRecord = {
  id: string;
  code?: string;
  title?: string;
  frameworkId?: string;
  frameworkTitle?: string;
  jurisdiction?: string;
  authority?: string;
  subject?: string;
  stage?: string;
  nativeType?: string;
  status?: string;
  releaseId?: string;
  text?: string;
  rightsMode?: string;
  sourceLocator?: string;
  officialUrl?: string;
  verificationStatus?: string;
  provenance?: string;
  coverageState?: string;
  nativeStructure?: Record<string, string>;
};

export type StandardsItemDetail = {
  record: StandardsRecord;
  releaseId: string;
  candidateOnly: boolean;
  ancestors: StandardsRecord[];
  children: StandardsRecord[];
  provenance: {
    sourceLocator?: { kind?: string; jsonPointer?: string; locator?: string };
    sourceReleaseId?: string;
    candidateReleaseId?: string;
    snapshotId?: string;
    manifestId?: string;
  };
  rights: { api?: string; fullText?: string; rawBytes?: string };
  availability: {
    metadata?: boolean;
    fullText?: boolean;
    rawBytes?: boolean;
    searchSnippet?: boolean;
    expansions?: boolean;
  };
  unavailable?: string;
};

export type StandardsSearchResult = {
  records: StandardsRecord[];
  releaseId: string;
  candidateOnly: boolean;
  hasMore: boolean;
  nextCursor?: string;
  unavailable?: string;
};

export type StandardsFrameworkDetail = {
  id: string;
  name?: string;
  title?: string;
  status: string;
  releaseId: string;
  candidateOnly: boolean;
  authority?: string;
  jurisdiction?: string;
  subject?: string;
  stage?: string;
  overview?: string;
  hierarchy?: { rootCount?: number; maxDepth?: number; parentField?: string };
  nativeTypes: string[];
  stages: string[];
  subjects: string[];
  languages: string[];
  nodeCount?: number;
  tree: StandardsRecord[];
  versions: StandardsRecord[];
  sourceLocator?: string;
  officialUrl?: string;
  provenance?: string;
  verificationStatus?: string;
  rightsMode?: string;
  rightsApi?: string;
  availability?: string;
  unavailable?: string;
};

export type StandardsCoverageFramework = {
  frameworkVersionId?: string;
  id?: string;
  name?: string;
  title?: string;
  jurisdiction?: string;
  jurisdictionCode?: string;
  authority?: string;
  hierarchy?: { parentField?: string; rootCount?: number; maxDepth?: number };
  nativeTypes: string[];
  stages: string[];
  subjects: string[];
  languages: string[];
  nodeCount?: number;
  relationships?: {
    status?: string;
    reviewedCount?: number;
    unmapped?: boolean;
  };
  provenance?: Record<string, unknown>;
  rights?: Record<string, unknown>;
  availability?: Record<string, unknown>;
};

export type StandardsCoverageResult = {
  release: {
    id: string;
    status?: string;
    public?: boolean;
    stable?: boolean;
    fixtureOnly?: boolean;
    asOfDate?: string;
    sourceLocator?: Record<string, unknown>;
    provenance?: Record<string, unknown>;
  };
  frameworkCount: number;
  nodeCount: number;
  frameworks: StandardsCoverageFramework[];
  coverageState?: string;
  reviewedRelationships?: { status?: string; count?: number; unmapped?: boolean };
  unmapped?: boolean;
  unavailable?: string;
};

export type StandardsSource = {
  id: string;
  name?: string;
  authority?: string;
  authorityStatus?: string;
  officialUrl?: string;
  officialDomain?: string;
  role?: string;
  frameworkId?: string;
  frameworkTitle?: string;
  releaseId: string;
  candidateOnly: boolean;
  fixtureOnly?: boolean;
  snapshotId?: string;
  asOfDate?: string;
  format?: string;
  rights: Record<string, string>;
  provenance?: {
    kind?: string;
    jsonPointer?: string;
    locator?: string;
    artifactSha256?: string;
    sourceReleaseId?: string;
  };
};

export type StandardsSourcesResult = {
  sources: StandardsSource[];
  releaseId: string;
  candidateOnly: boolean;
  unavailable?: string;
};

export type StandardsSourceDetail = StandardsSource & {
  authorityStatus?: string;
  status?: string;
  candidateReleaseId?: string;
  sourceReleaseId?: string;
  manifestId?: string;
  parserVersion?: string;
  mappingVersion?: string;
  normalizationVersion?: string;
  validationVersion?: string;
  artifactSha256?: string;
  sourceLocator?: {
    kind?: string;
    path?: string;
    jsonPointer?: string;
    locator?: string;
  };
  availability: {
    metadata: boolean;
    fullText: boolean;
    rawBytes: boolean;
  };
  unavailable?: string;
};

export type StandardsComparisonFramework = {
  frameworkVersionId?: string;
  release?: {
    id?: string;
    status?: string;
    public?: boolean;
    stable?: boolean;
    fixtureOnly?: boolean;
  };
  name?: string;
  hierarchy?: { parentField?: string; rootCount?: number; maxDepth?: number };
  nativeTypes: string[];
  stages: string[];
  subjects: string[];
  languages: string[];
  nodeCount?: number;
  relationships?: { status?: string; reviewedCount?: number; unmapped?: boolean };
  provenance?: Record<string, unknown>;
  rights?: Record<string, unknown>;
  availability?: Record<string, unknown>;
};

export type StandardsComparisonResult = {
  left: StandardsComparisonFramework;
  right: StandardsComparisonFramework;
  mode?: string;
  concepts?: { status?: string; count?: number };
  relationships?: { status?: string; count?: number; unmapped?: boolean };
  limitations: string[];
  leftRelease: string;
  rightRelease: string;
  candidateOnly: boolean;
  unavailable?: string;
};
export type StandardsChange = {
  id: string;
  fromCandidateReleaseId: string;
  toCandidateReleaseId: string;
  changeClass: "issuer-change" | "processing-correction";
  sourceLocator?: string;
  provenance?: Record<string, unknown>;
  candidateOnly: boolean;
  public: boolean;
  stable: boolean;
};
export type StandardsChangesResult = {
  changes: StandardsChange[];
  releaseId: string;
  unavailable?: string;
};

export type StandardsReadinessProjection = {
  status: string;
  count: number;
  relationshipStatus: string;
  reviewedCount: number;
  limitations: string[];
  releaseLineage: {
    candidateReleaseId: string;
    sourceReleaseId?: string;
    snapshotId?: string;
    manifestId?: string;
  };
  candidateOnly: boolean;
  public: boolean;
  stable: boolean;
  current: boolean;
  publishable: boolean;
  rightsStatus: string;
};

export type StandardsConceptsCrosswalksResult = {
  releaseId: string;
  concepts: StandardsReadinessProjection;
  crosswalks: StandardsReadinessProjection;
  unavailable?: string;
};

export type StandardsApiReadinessResult = {
  releaseId: string;
  releaseStatus: string;
  candidateOnly: true;
  public: false;
  stable: false;
  current: false;
  publishable: false;
  rightsStatus: "denied";
  apiAvailability: "metadata-only";
  provenance: {
    sourceReleaseId?: string;
    snapshotId?: string;
    manifestId?: string;
  };
  exports: { bulk: "denied"; case: "denied" };
  unavailable?: string;
};

const DEFAULT_STANDARDS_RELEASE = "standards-2026.08.0-preview";
const RELEASE_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;

export const defaultStandardsRelease = DEFAULT_STANDARDS_RELEASE;

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function releaseValue(value: unknown): string | undefined {
  const candidate = stringValue(value);
  return candidate && RELEASE_ID_PATTERN.test(candidate) ? candidate : undefined;
}

function configuredRelease(requested?: unknown): string {
  return (
    releaseValue(requested) ??
    releaseValue(process.env.STANDARDS_RELEASE_ID) ??
    DEFAULT_STANDARDS_RELEASE
  );
}

function displayValue(value: unknown, fallback = "Not supplied by the projection"): string {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "boolean") return value ? "Available" : "Unavailable";
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
}

function sourceLocatorValue(value: unknown): string | undefined {
  const direct = stringValue(value);
  if (direct) return direct;
  const locator = objectValue(value);
  const parts = [locator.kind, locator.path, locator.jsonPointer, locator.locator]
    .filter((part): part is string => typeof part === "string" && part.trim().length > 0)
    .map((part) => part.trim());
  return parts.length > 0 ? parts.join(" · ") : undefined;
}

function candidateOnlyFromMeta(meta: Record<string, unknown>): boolean {
  if (typeof meta.candidateOnly === "boolean") return meta.candidateOnly;
  return meta.stable !== true && meta.public !== true;
}

function recordFromContract(value: unknown): StandardsRecord | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  const resource =
    item.resource && typeof item.resource === "object"
      ? (item.resource as Record<string, unknown>)
      : item;
  const source =
    resource.source && typeof resource.source === "object"
      ? (resource.source as Record<string, unknown>)
      : {};
  const release = objectValue(resource.release ?? item.release);
  const texts = Array.isArray(resource.texts) ? resource.texts : [];
  const permittedText = texts.find((entry) => {
    if (!entry || typeof entry !== "object") return false;
    const text = entry as Record<string, unknown>;
    return text.rights === "public-api" && typeof text.value === "string";
  }) as Record<string, unknown> | undefined;
  const id = stringValue(resource.id);
  if (!id) return null;
  return {
    id,
    code: stringValue(resource.code) ?? stringValue(resource.sourceIdentifier),
    title:
      stringValue(resource.title) ??
      stringValue(resource.name) ??
      stringValue(resource.sourceLabel),
    frameworkId: stringValue(resource.frameworkId),
    frameworkTitle: stringValue(resource.frameworkTitle),
    jurisdiction: stringValue(resource.jurisdiction) ?? stringValue(resource.jurisdictionId),
    authority: stringValue(source.authority) ?? stringValue(resource.authority),
    subject: stringValue(resource.subject) ?? stringValue(resource.subjectId),
    stage: stringValue(resource.stage) ?? stringValue(resource.stageId),
    nativeType: stringValue(resource.nativeType),
    status: stringValue(resource.status),
    releaseId:
      stringValue(resource.releaseId) ??
      stringValue(release.id) ??
      stringValue(item.releaseId) ??
      stringValue(objectValue(item.release).id),
    text: stringValue(permittedText?.value),
    rightsMode: stringValue(source.rightsMode) ?? (permittedText ? "public-api" : "metadata-only"),
    sourceLocator: sourceLocatorValue(
      source.sourceLocator ?? resource.sourceLocator ?? item.sourceLocator,
    ),
    officialUrl: safeHttpUrl(source.officialUrl ?? resource.officialUrl ?? item.officialUrl),
    verificationStatus:
      stringValue(source.verificationStatus) ?? stringValue(resource.verificationStatus),
    provenance: stringValue(source.role),
    coverageState: permittedText ? "text-available" : "metadata-only",
    nativeStructure:
      resource.nativeStructure && typeof resource.nativeStructure === "object"
        ? Object.fromEntries(
            Object.entries(resource.nativeStructure as Record<string, unknown>).filter(
              (entry): entry is [string, string] => typeof entry[1] === "string",
            ),
          )
        : undefined,
  };
}

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function recordsFromPayload(value: unknown): StandardsRecord[] {
  const payload = objectValue(value);
  const data = Array.isArray(payload.data) ? payload.data : [];
  return data
    .map(recordFromContract)
    .filter((record): record is StandardsRecord => record !== null);
}

function firstRecord(value: unknown): StandardsRecord | null {
  const payload = objectValue(value);
  return recordFromContract(payload.data ?? value);
}

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
}

function projectionString(value: unknown, key: string): string | undefined {
  return stringValue(objectValue(value)[key]);
}

function projectionNumber(value: unknown, key: string): number | undefined {
  const item = objectValue(value)[key];
  return typeof item === "number" && Number.isFinite(item) ? item : undefined;
}

function projectionBoolean(value: unknown, key: string): boolean | undefined {
  const item = objectValue(value)[key];
  return typeof item === "boolean" ? item : undefined;
}

function comparisonFrameworkFromContract(value: unknown): StandardsComparisonFramework {
  const item = objectValue(value);
  const release = objectValue(item.release);
  const hierarchy = objectValue(item.hierarchy);
  const relationships = objectValue(item.relationships);
  return {
    frameworkVersionId: stringValue(item.frameworkVersionId),
    release: {
      id: stringValue(release.id),
      status: stringValue(release.status),
      public: projectionBoolean(release, "public"),
      stable: projectionBoolean(release, "stable"),
      fixtureOnly: projectionBoolean(release, "fixtureOnly"),
    },
    name: stringValue(item.name),
    hierarchy: {
      parentField: stringValue(hierarchy.parentField),
      rootCount: projectionNumber(hierarchy, "rootCount"),
      maxDepth: projectionNumber(hierarchy, "maxDepth"),
    },
    nativeTypes: stringList(item.nativeTypes),
    stages: stringList(item.stages),
    subjects: stringList(item.subjects),
    languages: stringList(item.languages),
    nodeCount: projectionNumber(item, "nodeCount"),
    relationships: {
      status: stringValue(relationships.status),
      reviewedCount: projectionNumber(relationships, "reviewedCount"),
      unmapped: projectionBoolean(relationships, "unmapped"),
    },
    provenance: objectValue(item.provenance),
    rights: objectValue(item.rights),
    availability: objectValue(item.availability),
  };
}

function safeHttpUrl(value: unknown): string | undefined {
  const candidate = stringValue(value);
  if (!candidate) return undefined;
  try {
    const url = new URL(candidate);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

async function standardsFetch(url: URL, releaseIds: string[], allowDenied = false) {
  const bearer = process.env.LOCAL_API_BEARER?.trim();
  if (!bearer) throw new Error("Standards API authorization is unavailable");
  const authorization = /^Bearer\s/i.test(bearer) ? bearer : `Bearer ${bearer}`;
  const response = await fetch(url, {
    headers: { Authorization: authorization },
    signal: AbortSignal.timeout(5_000),
    next: { revalidate: 60, tags: releaseIds.map((releaseId) => `standards:${releaseId}`) },
  });
  if (!response.ok && !(allowDenied && response.status === 403))
    throw new Error(`API returned ${response.status}`);
  return response;
}

function recordsForRelease(value: unknown, releaseId: string): StandardsRecord[] {
  const records = recordsFromPayload(value);
  if (records.some((record) => record.releaseId && record.releaseId !== releaseId)) {
    throw new Error("Standards record release mismatch");
  }
  return records;
}

function sourceFromContract(
  value: unknown,
  releaseId: string,
  candidateOnly: boolean,
): StandardsSource | null {
  const item = objectValue(value);
  const provenance = objectValue(item.provenance);
  const lineage = objectValue(item.lineage);
  const sourceLocatorValueRaw =
    item.sourceLocator ?? provenance.sourceLocator ?? lineage.sourceLocator;
  const sourceLocator = objectValue(sourceLocatorValueRaw);
  const id = stringValue(item.id) ?? stringValue(item.sourceId);
  if (!id) return null;
  const release = objectValue(item.release);
  const explicitReleases = [
    stringValue(item.candidateReleaseId),
    stringValue(release.id),
    stringValue(item.releaseId),
  ].filter((value): value is string => value !== undefined);
  const actualRelease = explicitReleases[0];
  if (!actualRelease || explicitReleases.some((value) => value !== actualRelease)) {
    if (actualRelease && actualRelease !== releaseId) {
      throw new Error("Standards source release mismatch");
    }
    return null;
  }
  if (actualRelease !== releaseId) {
    throw new Error("Standards source release mismatch");
  }
  const officialUrl = safeHttpUrl(item.officialUrl ?? item.officialPageUrl ?? item.url);
  const rightsSource = objectValue(item.rights);
  const rights = Object.fromEntries(
    ["authority", "acquisition", "storage", "display", "api", "bulk", "stablePublication"].map(
      (key) => [key, displayValue(rightsSource[key])],
    ),
  );
  return {
    id,
    name: stringValue(item.name) ?? stringValue(item.title),
    authority: stringValue(item.authority) ?? stringValue(item.publisher),
    authorityStatus: stringValue(item.authorityStatus),
    officialUrl,
    officialDomain: officialUrl ? new URL(officialUrl).hostname : undefined,
    role: stringValue(item.role) ?? stringValue(item.sourceRole),
    frameworkId: stringValue(item.frameworkId),
    frameworkTitle: stringValue(item.frameworkTitle),
    releaseId: actualRelease ?? releaseId,
    candidateOnly,
    fixtureOnly: objectValue(item.fixture).status === "fixture-only",
    snapshotId: stringValue(item.snapshotId) ?? stringValue(provenance.snapshotId),
    asOfDate: stringValue(item.asOfDate) ?? stringValue(item.as_of_date),
    format: stringValue(item.format) ?? stringValue(item.sourceFormat),
    rights,
    provenance: {
      kind: stringValue(sourceLocator.kind),
      jsonPointer: stringValue(sourceLocator.jsonPointer),
      locator: sourceLocatorValue(sourceLocatorValueRaw),
      artifactSha256: stringValue(item.artifactSha256) ?? stringValue(provenance.artifactSha256),
      sourceReleaseId: stringValue(item.sourceReleaseId) ?? stringValue(provenance.sourceReleaseId),
    },
  };
}

function sourceDetailFromContract(
  value: unknown,
  releaseId: string,
  candidateOnly: boolean,
): StandardsSourceDetail | null {
  const item = objectValue(value);
  const release = objectValue(item.release);
  const provenance = objectValue(item.provenance);
  const sourceLocatorValueRaw = item.sourceLocator ?? provenance.sourceLocator;
  const sourceLocator = objectValue(sourceLocatorValueRaw);
  const source = sourceFromContract(item, releaseId, candidateOnly);
  if (!source) return null;
  const explicitReleases = [
    stringValue(item.candidateReleaseId),
    stringValue(release.id),
    stringValue(item.releaseId),
    stringValue(provenance.candidateReleaseId),
  ].filter((value): value is string => value !== undefined);
  if (
    explicitReleases.length === 0 ||
    explicitReleases.some((value) => value !== explicitReleases[0]) ||
    explicitReleases[0] !== releaseId
  ) {
    throw new Error("Source detail release mismatch");
  }
  const candidateReleaseId = explicitReleases[0];
  const availability = objectValue(item.availability);
  return {
    ...source,
    authorityStatus: stringValue(item.authorityStatus),
    status: stringValue(item.status) ?? stringValue(release.status),
    candidateReleaseId,
    sourceReleaseId: stringValue(item.sourceReleaseId) ?? stringValue(provenance.sourceReleaseId),
    manifestId: stringValue(item.manifestId) ?? stringValue(provenance.manifestId),
    parserVersion: stringValue(item.parserVersion) ?? stringValue(provenance.parserVersion),
    mappingVersion: stringValue(item.mappingVersion) ?? stringValue(provenance.mappingVersion),
    normalizationVersion:
      stringValue(item.normalizationVersion) ?? stringValue(provenance.normalizationVersion),
    validationVersion:
      stringValue(item.validationVersion) ?? stringValue(provenance.validationVersion),
    artifactSha256: stringValue(item.artifactSha256) ?? stringValue(provenance.artifactSha256),
    sourceLocator: {
      kind: stringValue(sourceLocator.kind),
      path: stringValue(sourceLocator.path),
      jsonPointer: stringValue(sourceLocator.jsonPointer),
      locator: sourceLocatorValue(sourceLocatorValueRaw),
    },
    availability: {
      metadata: projectionBoolean(availability, "metadata") ?? true,
      fullText: projectionBoolean(availability, "fullText") ?? false,
      rawBytes: false,
    },
  };
}

function coverageFrameworkFromContract(value: unknown): StandardsCoverageFramework | null {
  const item = objectValue(value);
  const hierarchy = objectValue(item.hierarchy);
  const relationships = objectValue(item.relationships);
  const id = stringValue(item.frameworkVersionId) ?? stringValue(item.id);
  if (!id) return null;
  return {
    frameworkVersionId: stringValue(item.frameworkVersionId) ?? id,
    id,
    name: stringValue(item.name),
    title: stringValue(item.title),
    jurisdiction: stringValue(item.jurisdiction) ?? stringValue(item.jurisdictionName),
    jurisdictionCode: stringValue(item.jurisdictionCode) ?? stringValue(item.jurisdictionId),
    authority: stringValue(item.authority),
    hierarchy: {
      parentField: stringValue(hierarchy.parentField),
      rootCount: projectionNumber(hierarchy, "rootCount"),
      maxDepth: projectionNumber(hierarchy, "maxDepth"),
    },
    nativeTypes: stringList(item.nativeTypes),
    stages: stringList(item.stages),
    subjects: stringList(item.subjects),
    languages: stringList(item.languages),
    nodeCount: projectionNumber(item, "nodeCount"),
    relationships: {
      status: stringValue(relationships.status),
      reviewedCount: projectionNumber(relationships, "reviewedCount"),
      unmapped: projectionBoolean(relationships, "unmapped"),
    },
    provenance: objectValue(item.provenance),
    rights: objectValue(item.rights),
    availability: objectValue(item.availability),
  };
}

function coverageReleaseFromContract(
  value: unknown,
  fallbackId: string,
): StandardsCoverageResult["release"] {
  const release = objectValue(value);
  return {
    id: stringValue(release.id) ?? fallbackId,
    status: stringValue(release.status),
    public: projectionBoolean(release, "public"),
    stable: projectionBoolean(release, "stable"),
    fixtureOnly: projectionBoolean(release, "fixtureOnly"),
    asOfDate:
      stringValue(release.asOfDate) ??
      stringValue(release.as_of_date) ??
      stringValue(release.updatedAt),
    sourceLocator: objectValue(release.sourceLocator),
    provenance: objectValue(release.provenance),
  };
}

export async function getStandardsFrameworkDetail(
  slug: string,
  requestedRelease?: string,
): Promise<StandardsFrameworkDetail> {
  const releaseId = configuredRelease(requestedRelease);
  const baseUrl = process.env.STANDARDS_API_URL?.trim();
  const unavailable = "The synchronized Standards API is not configured in this environment.";
  const empty: StandardsFrameworkDetail = {
    id: slug,
    status: "Candidate",
    releaseId,
    candidateOnly: true,
    nativeTypes: [],
    stages: [],
    subjects: [],
    languages: [],
    tree: [],
    versions: [],
    unavailable,
  };
  if (!baseUrl) return empty;

  const request = async (path: string) => {
    const url = new URL(path, baseUrl);
    url.searchParams.set("release", releaseId);
    const response = await standardsFetch(url, [releaseId]);
    return response.json() as Promise<unknown>;
  };
  try {
    const id = encodeURIComponent(slug);
    const [detailPayload, versionPayload, treePayload, provenancePayload] = await Promise.all([
      request(`/v1/frameworks/${id}`),
      request(`/v1/framework-versions/${id}`),
      request(`/v1/framework-versions/${id}/tree`),
      request(`/v1/standards/${id}/provenance`),
    ]);
    const detail = firstRecord(detailPayload);
    const version = firstRecord(versionPayload);
    const detailRaw = objectValue(objectValue(detailPayload).data ?? detailPayload);
    const provenanceRaw = objectValue(objectValue(provenancePayload).data ?? provenancePayload);
    if (!detail && !version) throw new Error("Framework projection unavailable");
    const safe = detail ?? version!;
    for (const record of [detail, version]) {
      if (record?.releaseId && record.releaseId !== releaseId) {
        throw new Error("Framework record release mismatch");
      }
    }
    const hierarchy = objectValue(detailRaw.hierarchy);
    const apiRelease = stringValue(objectValue(detailRaw.release).id) ?? releaseId;
    if (apiRelease !== releaseId) throw new Error("Framework release mismatch");
    return {
      id: safe.id,
      name: projectionString(detailRaw, "name"),
      title: safe.title,
      status: safe.status ?? "Candidate",
      releaseId: apiRelease,
      candidateOnly:
        objectValue(detailRaw.release).stable !== true &&
        objectValue(detailRaw.release).public !== true,
      authority: safe.authority,
      jurisdiction: safe.jurisdiction,
      subject: safe.subject,
      stage: safe.stage,
      overview:
        projectionString(detailRaw, "description") ?? projectionString(detailRaw, "overview"),
      hierarchy: {
        parentField: projectionString(hierarchy, "parentField"),
        rootCount: typeof hierarchy.rootCount === "number" ? hierarchy.rootCount : undefined,
        maxDepth: typeof hierarchy.maxDepth === "number" ? hierarchy.maxDepth : undefined,
      },
      nativeTypes: stringList(detailRaw.nativeTypes),
      stages: stringList(detailRaw.stages),
      subjects: stringList(detailRaw.subjects),
      languages: stringList(detailRaw.languages),
      nodeCount: typeof detailRaw.nodeCount === "number" ? detailRaw.nodeCount : undefined,
      tree: recordsForRelease(treePayload, releaseId),
      versions: version ? [version] : [],
      sourceLocator: safe.sourceLocator,
      officialUrl: safe.officialUrl,
      provenance: safe.provenance ?? projectionString(provenanceRaw, "role"),
      verificationStatus: safe.verificationStatus,
      rightsMode: safe.rightsMode,
      rightsApi: projectionString(objectValue(provenanceRaw.rights), "api"),
      availability: projectionString(objectValue(provenanceRaw.availability), "metadata")
        ? "Metadata available; restricted wording unavailable"
        : "Metadata-only projection",
    };
  } catch {
    return {
      ...empty,
      unavailable:
        "Framework details are temporarily unavailable. No unverified local data is shown.",
    };
  }
}

function safeItemProvenance(value: unknown): StandardsItemDetail["provenance"] {
  const item = objectValue(value);
  const locatorValue = item.sourceLocator;
  const locator = objectValue(locatorValue);
  const safeString = (key: string) => stringValue(item[key]);
  return {
    sourceLocator: {
      kind: stringValue(locator.kind),
      jsonPointer: stringValue(locator.jsonPointer),
      locator: sourceLocatorValue(locatorValue),
    },
    sourceReleaseId: safeString("sourceReleaseId"),
    candidateReleaseId: safeString("candidateReleaseId"),
    snapshotId: safeString("snapshotId"),
    manifestId: safeString("manifestId"),
  };
}

export async function getStandardsItemDetail(
  id: string,
  requestedRelease?: string,
): Promise<StandardsItemDetail> {
  const releaseId = configuredRelease(requestedRelease);
  const unavailable = "The synchronized Standards API is not configured in this environment.";
  const empty: StandardsItemDetail = {
    record: { id },
    releaseId,
    candidateOnly: true,
    ancestors: [],
    children: [],
    provenance: {},
    rights: { api: "denied", fullText: "denied", rawBytes: "denied" },
    availability: { metadata: false, fullText: false, rawBytes: false },
    unavailable,
  };
  const baseUrl = process.env.STANDARDS_API_URL?.trim();
  if (!baseUrl) return empty;

  try {
    const request = async (suffix: string) => {
      const url = new URL(`/v1/standards/${encodeURIComponent(id)}${suffix}`, baseUrl);
      url.searchParams.set("release", releaseId);
      const response = await standardsFetch(url, [releaseId]);
      return (await response.json()) as { data?: unknown; meta?: Record<string, unknown> };
    };
    const [detailPayload, childrenPayload, ancestorsPayload, provenancePayload] = await Promise.all(
      [request(""), request("/children"), request("/ancestors"), request("/provenance")],
    );
    const payloads = [detailPayload, childrenPayload, ancestorsPayload, provenancePayload];
    for (const payload of payloads) {
      const apiRelease = stringValue(payload.meta?.releaseId);
      if (apiRelease && apiRelease !== releaseId) throw new Error("Standards release mismatch");
    }
    const record = firstRecord(detailPayload);
    if (!record || (record.releaseId && record.releaseId !== releaseId)) {
      throw new Error("Standards item release mismatch");
    }
    const provenanceData = objectValue(provenancePayload.data);
    const release = objectValue(provenanceData.release);
    if (stringValue(release.id) && stringValue(release.id) !== releaseId) {
      throw new Error("Standards provenance release mismatch");
    }
    return {
      record,
      releaseId,
      candidateOnly: provenanceData.release
        ? release.stable !== true && release.public !== true
        : true,
      ancestors: recordsForRelease(ancestorsPayload, releaseId),
      children: recordsForRelease(childrenPayload, releaseId),
      provenance: safeItemProvenance(provenanceData.provenance),
      rights: {
        api: stringValue(objectValue(provenanceData.rights).api) ?? "denied",
        fullText: stringValue(objectValue(provenanceData.rights).fullText) ?? "denied",
        rawBytes: "denied",
      },
      availability: {
        metadata: projectionBoolean(provenanceData.availability, "metadata") ?? true,
        fullText: projectionBoolean(provenanceData.availability, "fullText") ?? false,
        rawBytes: false,
        searchSnippet: projectionBoolean(provenanceData.availability, "searchSnippet") ?? false,
        expansions: projectionBoolean(provenanceData.availability, "expansions") ?? false,
      },
    };
  } catch {
    return {
      ...empty,
      unavailable:
        "This Standards item is temporarily unavailable. No unverified local data is shown.",
    };
  }
}

export async function searchStandards(params: StandardsQuery = {}): Promise<StandardsSearchResult> {
  const releaseId = configuredRelease(params.release);
  const baseUrl = process.env.STANDARDS_API_URL?.trim();
  if (!baseUrl) {
    return {
      records: [],
      releaseId,
      candidateOnly: true,
      hasMore: false,
      unavailable: "The synchronized Standards API is not configured in this environment.",
    };
  }
  const url = new URL("/v1/standards/search", baseUrl);
  url.searchParams.set("release", releaseId);
  url.searchParams.set("limit", "24");
  for (const key of ["q", "jurisdiction", "stage", "subject", "cursor"] as const) {
    if (params[key]) url.searchParams.set(key, params[key]!);
  }
  try {
    const response = await standardsFetch(url, [releaseId]);
    const payload = (await response.json()) as { data?: unknown; meta?: Record<string, unknown> };
    const meta = payload.meta ?? {};
    const apiRelease = stringValue(meta.releaseId) ?? releaseId;
    if (apiRelease !== releaseId) throw new Error("Standards search release mismatch");
    const records = recordsForRelease(payload, releaseId);
    return {
      records,
      releaseId: apiRelease,
      candidateOnly: candidateOnlyFromMeta(meta),
      hasMore: meta.hasMore === true,
      nextCursor: stringValue(meta.nextCursor),
    };
  } catch {
    return {
      records: [],
      releaseId,
      candidateOnly: true,
      hasMore: false,
      unavailable:
        "Standards search is temporarily unavailable. The page is showing no unverified local data.",
    };
  }
}

export async function getStandardsSources(): Promise<StandardsSourcesResult> {
  const releaseId = configuredRelease();
  const baseUrl = process.env.STANDARDS_API_URL?.trim();
  const unavailable = "The synchronized Standards API is not configured in this environment.";
  if (!baseUrl) return { sources: [], releaseId, candidateOnly: true, unavailable };

  try {
    const url = new URL("/v1/standards/sources", baseUrl);
    url.searchParams.set("release", releaseId);
    const response = await standardsFetch(url, [releaseId]);
    const payload = (await response.json()) as { data?: unknown; meta?: Record<string, unknown> };
    const meta = payload.meta ?? {};
    const apiRelease = stringValue(meta.releaseId) ?? releaseId;
    if (apiRelease !== releaseId) throw new Error("Source projection release mismatch");
    const candidateOnly = candidateOnlyFromMeta(meta);
    const data = Array.isArray(payload.data) ? payload.data : [];
    return {
      sources: data
        .map((item) => sourceFromContract(item, releaseId, candidateOnly))
        .filter((item): item is StandardsSource => item !== null),
      releaseId,
      candidateOnly,
    };
  } catch {
    return {
      sources: [],
      releaseId,
      candidateOnly: true,
      unavailable:
        "Standards sources are temporarily unavailable. No unverified local data is shown.",
    };
  }
}

export async function getStandardsSourceDetail(
  id: string,
  requestedRelease?: string,
): Promise<StandardsSourceDetail> {
  const releaseId = configuredRelease(requestedRelease);
  const empty: StandardsSourceDetail = {
    id,
    releaseId,
    candidateOnly: true,
    rights: {
      authority: "Not supplied by the projection",
      acquisition: "denied",
      storage: "denied",
      display: "denied",
      api: "denied",
      bulk: "denied",
      stablePublication: "denied",
    },
    availability: { metadata: false, fullText: false, rawBytes: false },
    unavailable: "The synchronized Standards API is not configured in this environment.",
  };
  const baseUrl = process.env.STANDARDS_API_URL?.trim();
  if (!baseUrl) return empty;
  try {
    const url = new URL(`/v1/standards/sources/${encodeURIComponent(id)}`, baseUrl);
    url.searchParams.set("release", releaseId);
    const response = await standardsFetch(url, [releaseId]);
    const payload = (await response.json()) as {
      data?: unknown;
      meta?: Record<string, unknown>;
    };
    const metaRelease = stringValue(payload.meta?.releaseId);
    if (metaRelease && metaRelease !== releaseId) {
      throw new Error("Source detail API release mismatch");
    }
    const detail = sourceDetailFromContract(
      payload.data,
      releaseId,
      candidateOnlyFromMeta(payload.meta ?? {}),
    );
    if (!detail) throw new Error("Source detail projection unavailable");
    return detail;
  } catch {
    return {
      ...empty,
      unavailable:
        "This Standards source is temporarily unavailable. No unverified local data is shown.",
    };
  }
}

export async function getStandardsCoverage(): Promise<StandardsCoverageResult> {
  const releaseId = configuredRelease();
  const baseUrl = process.env.STANDARDS_API_URL?.trim();
  const unavailable = "The synchronized Standards API is not configured in this environment.";
  const empty: StandardsCoverageResult = {
    release: { id: releaseId, status: "candidate", public: false, stable: false },
    frameworkCount: 0,
    nodeCount: 0,
    frameworks: [],
    coverageState: "unavailable",
    unavailable,
  };
  if (!baseUrl) return empty;

  try {
    const url = new URL("/v1/standards/coverage", baseUrl);
    url.searchParams.set("release", releaseId);
    const response = await standardsFetch(url, [releaseId]);
    const payload = (await response.json()) as { data?: unknown };
    const data = objectValue(payload.data);
    const frameworks = Array.isArray(data.frameworks)
      ? data.frameworks
          .map(coverageFrameworkFromContract)
          .filter((item): item is StandardsCoverageFramework => item !== null)
      : [];
    const result: StandardsCoverageResult = {
      release: coverageReleaseFromContract(data.release, releaseId),
      frameworkCount: projectionNumber(data, "frameworkCount") ?? frameworks.length,
      nodeCount: projectionNumber(data, "nodeCount") ?? 0,
      frameworks,
      coverageState: stringValue(data.coverageState),
      reviewedRelationships: {
        status: stringValue(objectValue(data.reviewedRelationships).status),
        count: projectionNumber(objectValue(data.reviewedRelationships), "count"),
        unmapped: projectionBoolean(objectValue(data.reviewedRelationships), "unmapped"),
      },
      unmapped: projectionBoolean(data, "unmapped"),
    };
    if (result.release.id !== releaseId) {
      return {
        ...empty,
        unavailable: "The coverage projection did not match the configured release.",
      };
    }
    return result;
  } catch {
    return {
      ...empty,
      unavailable:
        "Standards coverage is temporarily unavailable. No unverified local data is shown.",
    };
  }
}

function readinessProjection(
  value: unknown,
  expectedPath: "concepts" | "crosswalks",
  releaseId: string,
): StandardsReadinessProjection {
  const data = objectValue(value);
  const lineage = objectValue(data.releaseLineage);
  const relationship = objectValue(data.relationshipSemantics);
  const safety = objectValue(data.safety);
  const candidateReleaseId = stringValue(lineage.candidateReleaseId);
  if (
    candidateReleaseId !== releaseId ||
    (expectedPath === "concepts" && data.status !== "unmapped") ||
    (expectedPath === "crosswalks" && data.status !== "empty") ||
    relationship.status !== "reviewed-only" ||
    relationship.reviewedCount !== 0 ||
    safety.candidateOnly !== true ||
    safety.preview !== true ||
    safety.public !== false ||
    safety.stable !== false ||
    safety.current !== false ||
    safety.publishable !== false ||
    safety.rightsStatus !== "denied"
  ) {
    throw new Error("Unsafe or mismatched Standards readiness projection");
  }
  const items = data[expectedPath];
  if (!Array.isArray(items) || items.length !== 0) {
    throw new Error("Standards readiness projection contains unreviewed data");
  }
  return {
    status: expectedPath === "concepts" ? "unmapped" : "empty",
    count: 0,
    relationshipStatus: "reviewed-only",
    reviewedCount: 0,
    limitations: stringList(data.limitations),
    releaseLineage: {
      candidateReleaseId,
      sourceReleaseId: stringValue(lineage.sourceReleaseId),
      snapshotId: stringValue(lineage.snapshotId),
      manifestId: stringValue(lineage.manifestId),
    },
    candidateOnly: true,
    public: false,
    stable: false,
    current: false,
    publishable: false,
    rightsStatus: "denied",
  };
}

export async function getStandardsConceptsCrosswalks(): Promise<StandardsConceptsCrosswalksResult> {
  const releaseId = configuredRelease();
  const unavailable = "The synchronized Standards API is not configured in this environment.";
  const empty: StandardsConceptsCrosswalksResult = {
    releaseId,
    concepts: {
      status: "unmapped",
      count: 0,
      relationshipStatus: "reviewed-only",
      reviewedCount: 0,
      limitations: [],
      releaseLineage: { candidateReleaseId: releaseId },
      candidateOnly: true,
      public: false,
      stable: false,
      current: false,
      publishable: false,
      rightsStatus: "denied",
    },
    crosswalks: {
      status: "empty",
      count: 0,
      relationshipStatus: "reviewed-only",
      reviewedCount: 0,
      limitations: [],
      releaseLineage: { candidateReleaseId: releaseId },
      candidateOnly: true,
      public: false,
      stable: false,
      current: false,
      publishable: false,
      rightsStatus: "denied",
    },
    unavailable,
  };
  const baseUrl = process.env.STANDARDS_API_URL?.trim();
  if (!baseUrl) return empty;
  try {
    const urls = ["concepts", "crosswalks"].map((path) => {
      const url = new URL(`/v1/${path}`, baseUrl);
      url.searchParams.set("release", releaseId);
      return url;
    });
    const responses = await Promise.all(urls.map((url) => standardsFetch(url, [releaseId])));
    const payloads = await Promise.all(
      responses.map(
        (response) =>
          response.json() as Promise<{ data?: unknown; meta?: Record<string, unknown> }>,
      ),
    );
    const projections = payloads.map((payload, index) => {
      const meta = payload.meta ?? {};
      if (
        (stringValue(meta.release) ??
          stringValue(meta.releaseId) ??
          stringValue(meta.standardsRelease)) !== releaseId ||
        meta.candidateOnly !== true ||
        meta.public !== false ||
        meta.stable !== false ||
        meta.current !== false ||
        meta.publishable !== false ||
        meta.rightsStatus !== "denied"
      ) {
        throw new Error("Standards readiness meta release or safety mismatch");
      }
      return readinessProjection(payload.data, index === 0 ? "concepts" : "crosswalks", releaseId);
    });
    return { releaseId, concepts: projections[0], crosswalks: projections[1] };
  } catch {
    return {
      ...empty,
      unavailable:
        "Standards concepts and crosswalks are temporarily unavailable. No unverified local data is shown.",
    };
  }
}

export async function getStandardsApiReadiness(): Promise<StandardsApiReadinessResult> {
  const releaseId = configuredRelease();
  const unavailable = "The synchronized Standards API is not configured in this environment.";
  const empty: StandardsApiReadinessResult = {
    releaseId,
    releaseStatus: "candidate",
    candidateOnly: true,
    public: false,
    stable: false,
    current: false,
    publishable: false,
    rightsStatus: "denied",
    apiAvailability: "metadata-only",
    provenance: {},
    exports: { bulk: "denied", case: "denied" },
    unavailable,
  };
  if (!process.env.STANDARDS_API_URL?.trim()) return empty;
  try {
    const readiness = await getStandardsConceptsCrosswalks();
    if (readiness.unavailable) return { ...empty, unavailable: readiness.unavailable };
    const lineage = readiness.concepts.releaseLineage;
    if (
      readiness.releaseId !== releaseId ||
      readiness.concepts.candidateOnly !== true ||
      readiness.concepts.public !== false ||
      readiness.concepts.stable !== false ||
      readiness.concepts.current !== false ||
      readiness.concepts.publishable !== false ||
      readiness.concepts.rightsStatus !== "denied" ||
      readiness.crosswalks.releaseLineage.candidateReleaseId !== releaseId
    )
      throw new Error("Unsafe Standards release metadata");

    const responses = await Promise.all(
      ["bulk", "case"].map((kind) => {
        const url = new URL(`/v1/standards/${kind}`, process.env.STANDARDS_API_URL);
        url.searchParams.set("release", releaseId);
        return standardsFetch(url, [releaseId], true);
      }),
    );
    for (const response of responses) {
      if (response.status !== 403) throw new Error("Standards export was not denied");
      const payload = (await response.json()) as Record<string, unknown>;
      if (
        payload.code !== "rights_denied" ||
        payload.export !== "denied" ||
        payload.candidateOnly !== true ||
        payload.public !== false ||
        payload.stable !== false ||
        payload.rightsStatus !== "denied"
      )
        throw new Error("Unsafe Standards export metadata");
    }
    return {
      ...empty,
      releaseStatus: "candidate",
      provenance: {
        sourceReleaseId: lineage.sourceReleaseId,
        snapshotId: lineage.snapshotId,
        manifestId: lineage.manifestId,
      },
      unavailable: undefined,
    };
  } catch {
    return {
      ...empty,
      unavailable:
        "Standards API readiness is temporarily unavailable. No unverified data is shown.",
    };
  }
}

export async function getStandardsChanges(
  frameworkId = "framework-iowa-mathematics",
): Promise<StandardsChangesResult> {
  const releaseId = "candidate-ia-mathematics-fixture-2026";
  const baseUrl = process.env.STANDARDS_API_URL?.trim();
  const unavailable =
    "Standards change history is unavailable until the candidate API release is configured.";
  if (!baseUrl) return { changes: [], releaseId, unavailable };
  try {
    const url = new URL(
      `/v1/framework-versions/${encodeURIComponent(frameworkId)}/changes`,
      baseUrl,
    );
    url.searchParams.set("release", releaseId);
    const payload = (await (await standardsFetch(url, [releaseId])).json()) as {
      data?: unknown;
      meta?: Record<string, unknown>;
    };
    const meta = payload.meta ?? {};
    const apiRelease = stringValue(meta.release) ?? stringValue(meta.standardsRelease) ?? releaseId;
    if (apiRelease !== releaseId) throw new Error("Standards changes release mismatch");
    const changes = Array.isArray(payload.data)
      ? payload.data
          .map((item) => {
            const row = objectValue(item);
            return {
              id: stringValue(row.id) ?? "",
              fromCandidateReleaseId: stringValue(row.fromCandidateReleaseId) ?? "",
              toCandidateReleaseId: stringValue(row.toCandidateReleaseId) ?? "",
              changeClass:
                row.changeClass === "issuer-change" ? "issuer-change" : "processing-correction",
              sourceLocator: sourceLocatorValue(row.sourceLocator),
              provenance: objectValue(row.provenance),
              candidateOnly: row.candidateOnly === true,
              public: row.public === true,
              stable: row.stable === true,
            } satisfies StandardsChange;
          })
          .filter(
            (item) =>
              item.id &&
              item.toCandidateReleaseId === releaseId &&
              item.candidateOnly &&
              !item.public &&
              !item.stable,
          )
      : [];
    return { changes, releaseId };
  } catch {
    return { changes: [], releaseId, unavailable };
  }
}

export async function getStandardsComparison(
  leftRelease: string,
  rightRelease: string,
): Promise<StandardsComparisonResult> {
  const unavailable = "The synchronized Standards API is not configured in this environment.";
  const empty = (message: string): StandardsComparisonResult => ({
    left: { nativeTypes: [], stages: [], subjects: [], languages: [] },
    right: { nativeTypes: [], stages: [], subjects: [], languages: [] },
    limitations: [],
    leftRelease,
    rightRelease,
    candidateOnly: true,
    unavailable: message,
  });
  const baseUrl = process.env.STANDARDS_API_URL?.trim();
  if (!baseUrl) return empty(unavailable);
  if (!leftRelease || !rightRelease) {
    return empty("Choose two exact candidate releases to compare.");
  }
  try {
    const url = new URL("/v1/standards/comparison", baseUrl);
    url.searchParams.set("left_release", leftRelease);
    url.searchParams.set("right_release", rightRelease);
    const response = await standardsFetch(url, [leftRelease, rightRelease]);
    const payload = (await response.json()) as { data?: unknown; meta?: Record<string, unknown> };
    const meta = payload.meta ?? {};
    const data = objectValue(payload.data);
    const releases = Array.isArray(meta.comparisonReleases) ? meta.comparisonReleases : [];
    if (
      (releases.length > 0 && (releases[0] !== leftRelease || releases[1] !== rightRelease)) ||
      meta.candidateOnly === false
    ) {
      throw new Error("Comparison projection release mismatch");
    }
    const left = comparisonFrameworkFromContract(data.left);
    const right = comparisonFrameworkFromContract(data.right);
    if (!left.frameworkVersionId || !right.frameworkVersionId) {
      throw new Error("Comparison framework projection unavailable");
    }
    if (
      (left.release?.id && left.release.id !== leftRelease) ||
      (right.release?.id && right.release.id !== rightRelease) ||
      left.release?.stable === true ||
      left.release?.public === true ||
      right.release?.stable === true ||
      right.release?.public === true
    ) {
      throw new Error("Comparison framework release mismatch");
    }
    return {
      left,
      right,
      mode: stringValue(data.mode),
      concepts: objectValue(data.concepts) as StandardsComparisonResult["concepts"],
      relationships: objectValue(data.relationships) as StandardsComparisonResult["relationships"],
      limitations: stringList(data.limitations),
      leftRelease,
      rightRelease,
      candidateOnly: meta.candidateOnly !== false,
    };
  } catch {
    return empty(
      "Standards comparison is temporarily unavailable. No unverified local data is shown.",
    );
  }
}
