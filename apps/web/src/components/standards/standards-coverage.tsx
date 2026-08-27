import type { StandardsCoverageFramework, StandardsCoverageResult } from "../../lib/standards-api";

function value(value: unknown, fallback = "Not supplied by the projection") {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "boolean") return value ? "Available" : "Unavailable";
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
}

function list(values: string[]) {
  return values.length ? values.join(", ") : "Not supplied by the projection";
}

function identity(framework: StandardsCoverageFramework) {
  return value(framework.jurisdiction ?? framework.jurisdictionCode);
}

function locator(framework: StandardsCoverageFramework, result: StandardsCoverageResult) {
  const source = framework.provenance?.sourceLocator ?? result.release.sourceLocator;
  if (!source || typeof source !== "object") return "Source locator not supplied by the projection";
  const sourceRecord = source as Record<string, unknown>;
  const details = [
    sourceRecord.kind,
    sourceRecord.path,
    sourceRecord.jsonPointer,
    sourceRecord.locator,
  ]
    .filter((item): item is string => typeof item === "string" && item.length > 0)
    .join(" · ");
  return details || "Source locator not supplied by the projection";
}

function rights(framework: StandardsCoverageFramework) {
  const rights = framework.rights ?? {};
  const api = value(rights.api, "metadata-only");
  const fullText = value(rights.fullText, "denied");
  const rawBytes = value(rights.rawBytes, "denied");
  return `API: ${api}; full text: ${fullText}; source bytes: ${rawBytes}`;
}

function FrameworkCoverage({
  framework,
  result,
}: {
  framework: StandardsCoverageFramework;
  result: StandardsCoverageResult;
}) {
  const title = value(framework.name ?? framework.title, "Unnamed framework");
  const id = value(framework.frameworkVersionId ?? framework.id);
  return (
    <article className="standards-coverage-card">
      <div className="standards-card-topline">
        <p className="standards-status">Metadata coverage</p>
        <span className="standards-coverage-id">{id}</span>
      </div>
      <h2>{title}</h2>
      <dl className="standards-coverage-meta">
        <dt>Jurisdiction</dt>
        <dd>{identity(framework)}</dd>
        <dt>Node count</dt>
        <dd>{framework.nodeCount ?? "Not supplied by the projection"}</dd>
        <dt>Structure</dt>
        <dd>
          {framework.hierarchy?.rootCount ?? "?"} roots · max depth{" "}
          {framework.hierarchy?.maxDepth ?? "?"}
        </dd>
        <dt>Native types</dt>
        <dd>{list(framework.nativeTypes)}</dd>
        <dt>Stages</dt>
        <dd>{list(framework.stages)}</dd>
        <dt>Subjects</dt>
        <dd>{list(framework.subjects)}</dd>
      </dl>
      <div className="standards-coverage-notes">
        <p>
          <strong>Rights and availability:</strong> {rights(framework)}. Metadata is available;
          wording and source bytes are not implied.
        </p>
        <p>
          <strong>Source/provenance:</strong> {locator(framework, result)}
        </p>
        <p>
          <strong>Reviewed relationships:</strong>{" "}
          {value(framework.relationships?.status, "No reviewed relationships")}; unmapped status is
          {framework.relationships?.unmapped === true ? " recorded." : " not supplied."}
        </p>
      </div>
    </article>
  );
}

export function StandardsCoverage({ result }: { result: StandardsCoverageResult }) {
  const release = result.release;
  const releaseStatus = value(release.status, "candidate");
  const candidateOnly = release.stable !== true && release.public !== true;
  const freshness = release.asOfDate
    ? `Source freshness: as of ${release.asOfDate}.`
    : "Source freshness: no as-of date supplied by the projection.";
  return (
    <section className="standards-coverage" aria-labelledby="coverage-results-heading">
      <div className="standards-release-notice" role="status">
        <strong>Release: {release.id}</strong> —{" "}
        {candidateOnly
          ? `${releaseStatus} preview; not a stable or current publication.`
          : `${releaseStatus} publication metadata returned by the synchronized API.`}{" "}
        {freshness}
      </div>
      <section className="standards-coverage-summary" aria-labelledby="coverage-results-heading">
        <div>
          <p className="eyebrow">Projection summary</p>
          <h2 id="coverage-results-heading">What this release contains</h2>
        </div>
        <dl className="standards-coverage-counts">
          <div>
            <dt>Frameworks</dt>
            <dd>{result.frameworkCount}</dd>
          </div>
          <div>
            <dt>Nodes</dt>
            <dd>{result.nodeCount}</dd>
          </div>
          <div>
            <dt>Coverage state</dt>
            <dd>{value(result.coverageState, "metadata-only")}</dd>
          </div>
          <div>
            <dt>Relationships</dt>
            <dd>{value(result.reviewedRelationships?.status, "unmapped")}</dd>
          </div>
        </dl>
        <p>
          Counts describe the synchronized candidate projection only. They are not a quality,
          equivalence, completeness, or educational support claim. Fixture-only and metadata-only
          records remain clearly bounded by their source and rights state.
        </p>
      </section>
      {result.unavailable ? (
        <section className="standards-empty info-card" role="alert">
          <h2>Coverage is unavailable</h2>
          <p>{result.unavailable}</p>
        </section>
      ) : result.frameworks.length === 0 ? (
        <section className="standards-empty info-card">
          <h2>No framework coverage is recorded</h2>
          <p>
            The pinned release contains no framework summaries. No coverage is inferred from sources
            outside the synchronized projection.
          </p>
        </section>
      ) : (
        <div className="standards-coverage-list">
          {result.frameworks.map((framework, index) => (
            <FrameworkCoverage
              key={framework.frameworkVersionId ?? framework.id ?? index}
              framework={framework}
              result={result}
            />
          ))}
        </div>
      )}
    </section>
  );
}
