import type {
  StandardsConceptsCrosswalksResult,
  StandardsReadinessProjection,
} from "../../lib/standards-api";

function ReadinessCard({
  label,
  projection,
}: {
  label: string;
  projection: StandardsReadinessProjection;
}) {
  return (
    <article className="standards-concepts-card">
      <p className="eyebrow">{label}</p>
      <h2>{projection.status === "unmapped" ? "Unmapped" : "Empty"}</h2>
      <dl className="standards-concepts-meta">
        <dt>Reviewed relationships</dt>
        <dd>{projection.reviewedCount}</dd>
        <dt>Review boundary</dt>
        <dd>{projection.relationshipStatus}</dd>
        <dt>Rights status</dt>
        <dd>{projection.rightsStatus}</dd>
      </dl>
      <p>
        No reviewed {label.toLowerCase()} are present in this candidate projection. No definitions,
        equivalence, or relationship is inferred.
      </p>
      {projection.limitations.length > 0 && (
        <ul>
          {projection.limitations.map((limitation) => (
            <li key={limitation}>{limitation}</li>
          ))}
        </ul>
      )}
    </article>
  );
}

export function StandardsConcepts({ result }: { result: StandardsConceptsCrosswalksResult }) {
  const lineage = result.concepts.releaseLineage;
  return (
    <section className="standards-concepts" aria-labelledby="concepts-results-heading">
      <div className="standards-release-notice" role="status">
        <strong>Release: {result.releaseId}</strong> — candidate preview; not public, stable,
        current, or publishable. Rights status: denied; API availability is metadata-only.
      </div>
      <section className="standards-concepts-summary" aria-labelledby="concepts-results-heading">
        <p className="eyebrow">Reviewed-only readiness</p>
        <h2 id="concepts-results-heading">Concepts and crosswalks stay empty until review.</h2>
        <p>
          The synchronized API supplies status, limitations, and release lineage only. Machine
          proposals, unreviewed relationships, restricted text, source bytes, and downloads are not
          displayed.
        </p>
        <dl className="standards-concepts-lineage">
          <dt>Candidate release</dt>
          <dd>{lineage.candidateReleaseId}</dd>
          <dt>Source release</dt>
          <dd>{lineage.sourceReleaseId ?? "Not supplied by the projection"}</dd>
          <dt>Snapshot</dt>
          <dd>{lineage.snapshotId ?? "Not supplied by the projection"}</dd>
          <dt>Manifest</dt>
          <dd>{lineage.manifestId ?? "Not supplied by the projection"}</dd>
        </dl>
      </section>
      {result.unavailable ? (
        <section className="standards-empty info-card" role="alert">
          <h2>Concepts and crosswalks are unavailable</h2>
          <p>{result.unavailable}</p>
        </section>
      ) : (
        <div className="standards-concepts-grid">
          <ReadinessCard label="Concepts" projection={result.concepts} />
          <ReadinessCard label="Crosswalks" projection={result.crosswalks} />
        </div>
      )}
    </section>
  );
}
