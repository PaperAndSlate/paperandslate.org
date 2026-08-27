import type {
  StandardsComparisonFramework,
  StandardsComparisonResult,
} from "../../lib/standards-api";

function value(input: unknown, fallback = "Not supplied by the projection") {
  if (typeof input === "string" && input.trim()) return input.trim();
  if (typeof input === "boolean") return input ? "Available" : "Unavailable";
  if (typeof input === "number" && Number.isFinite(input)) return String(input);
  return fallback;
}

function list(input: string[]) {
  return input.length ? input.join(", ") : "Not supplied by the projection";
}

function FrameworkSummary({
  label,
  framework,
}: {
  label: string;
  framework: StandardsComparisonFramework;
}) {
  const rights = value(framework.rights?.api, "metadata-only");
  const availability = value(framework.availability?.metadata, "Metadata-only projection");
  const candidateOnly = framework.release?.stable !== true && framework.release?.public !== true;
  return (
    <article className="standards-compare-card">
      <p className="eyebrow">{label}</p>
      <h2>{value(framework.name, "Unnamed framework")}</h2>
      <p className="standards-compare-id">{value(framework.frameworkVersionId)}</p>
      <p className="standards-compare-state">
        {candidateOnly ? "Candidate release; " : "Published release metadata; "}
        {framework.release?.fixtureOnly ? "fixture-only metadata; " : ""}
        {candidateOnly
          ? "stable/public publication is not implied."
          : "stable/public state is reported by the projection."}
      </p>
      <dl className="standards-compare-meta">
        <dt>Node count</dt>
        <dd>{framework.nodeCount ?? "Not supplied by the projection"}</dd>
        <dt>Hierarchy</dt>
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
        <dt>Languages</dt>
        <dd>{list(framework.languages)}</dd>
      </dl>
      <p className="standards-limited">
        Rights/API state: {rights}. {availability}. Restricted wording and source bytes are not
        displayed.
      </p>
    </article>
  );
}

export function StandardsCompare({ result }: { result: StandardsComparisonResult }) {
  const candidateOnly = result.candidateOnly;
  return (
    <section className="standards-compare" aria-label="Standards comparison">
      <div className="standards-release-notice" role="status">
        Comparing exact {candidateOnly ? "candidate releases" : "release projections"}:{" "}
        {result.leftRelease} and {result.rightRelease}.{" "}
        {candidateOnly
          ? "Not a stable or current publication."
          : "Publication state is reported by the projection."}
      </div>
      {result.unavailable ? (
        <section className="standards-empty info-card" role="alert">
          <h2 id="standards-compare-heading">Comparison is unavailable</h2>
          <p>{result.unavailable}</p>
        </section>
      ) : (
        <>
          <div className="standards-compare-grid">
            <FrameworkSummary label="Left release" framework={result.left} />
            <FrameworkSummary label="Right release" framework={result.right} />
          </div>
          <section
            className="standards-compare-differences"
            aria-labelledby="standards-compare-heading"
          >
            <p className="eyebrow">Structural comparison</p>
            <h2 id="standards-compare-heading">What the projections show</h2>
            <p>
              This view describes native structure only. It does not assess quality, equivalence,
              completeness, or legal or educational meaning.
            </p>
            <dl className="standards-compare-meta">
              <dt>Comparison mode</dt>
              <dd>{value(result.mode, "structure")}</dd>
              <dt>Concepts</dt>
              <dd>{value(result.concepts?.status, "unmapped")}</dd>
              <dt>Relationships</dt>
              <dd>{value(result.relationships?.status, "no-reviewed-relationships")}</dd>
              <dt>Relationship count</dt>
              <dd>{result.relationships?.count ?? 0}</dd>
            </dl>
            <p>
              <strong>Limitations:</strong>{" "}
              {result.limitations.length
                ? result.limitations.join(" ")
                : "No reviewed mappings are supplied by the projection."}
            </p>
          </section>
        </>
      )}
    </section>
  );
}
