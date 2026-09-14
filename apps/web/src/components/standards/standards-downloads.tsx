import type { StandardsApiReadinessResult } from "../../lib/standards-api";

export function StandardsDownloads({ result }: { result: StandardsApiReadinessResult }) {
  const candidate = result.candidateOnly;
  const maturity = candidate
    ? "candidate preview; not public, stable, current, or publishable"
    : "stable/public release metadata validated; exports remain closed";
  return (
    <section className="standards-readiness" aria-labelledby="downloads-heading">
      <div className="standards-release-notice" role="status">
        <strong>Release: {result.releaseId}</strong> — {maturity}. Rights status:{" "}
        {result.rightsStatus}; API availability is metadata-only.
      </div>
      {result.unavailable ? (
        <section className="standards-empty info-card" role="alert">
          <h2 id="downloads-heading">Downloads are unavailable</h2>
          <p>{result.unavailable}</p>
          <p>No source bytes, restricted text, artifact contents, or download URL is available.</p>
        </section>
      ) : (
        <>
          <section className="standards-readiness-intro">
            <p className="eyebrow">Release-bound availability</p>
            <h2 id="downloads-heading">Metadata is ready; exports remain closed.</h2>
            <p>
              {candidate
                ? "This candidate exposes release and provenance metadata only. Bulk and CASE exports are explicitly denied while rights review and publication remain unresolved."
                : "This stable release exposes validated release and provenance metadata. Bulk and CASE exports remain explicitly closed because no download grant is present in this contract."}
            </p>
          </section>
          <div className="standards-readiness-grid">
            <article className="standards-readiness-card">
              <h2>Bulk download</h2>
              <p className="standards-denied" role="status">
                Export denied
              </p>
              <p>No positive download link or artifact contents are provided for this release.</p>
            </article>
            <article className="standards-readiness-card">
              <h2>CASE compatibility</h2>
              <p className="standards-denied" role="status">
                Export denied
              </p>
              <p>CASE output is not available until rights approval and a stable release exist.</p>
            </article>
          </div>
          <dl className="standards-readiness-meta">
            <dt>Publication state</dt>
            <dd>
              {candidate ? "Candidate only · closed" : "Stable/public metadata · exports closed"}
            </dd>
            <dt>Source release</dt>
            <dd>{result.provenance.sourceReleaseId ?? "Not supplied by the projection"}</dd>
            <dt>Snapshot</dt>
            <dd>{result.provenance.snapshotId ?? "Not supplied by the projection"}</dd>
            <dt>Manifest</dt>
            <dd>{result.provenance.manifestId ?? "Not supplied by the projection"}</dd>
          </dl>
        </>
      )}
    </section>
  );
}
