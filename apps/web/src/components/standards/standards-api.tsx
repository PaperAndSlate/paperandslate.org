import type { StandardsApiReadinessResult } from "../../lib/standards-api";

export function StandardsApi({ result }: { result: StandardsApiReadinessResult }) {
  const candidate = result.candidateOnly;
  const maturity = candidate
    ? "candidate preview; not public, stable, current, or publishable"
    : "stable/public release metadata validated; API exports remain closed";
  const boundary = candidate
    ? "The selected candidate release is metadata-only, and no stable or public contract is implied."
    : "The selected stable release has validated public metadata; this surface remains read-only and release-bound.";
  return (
    <section className="standards-readiness" aria-labelledby="api-heading">
      <div className="standards-release-notice" role="status">
        <strong>Release: {result.releaseId}</strong> — {maturity}. Rights status:{" "}
        {result.rightsStatus}; API availability is metadata-only.
      </div>
      {result.unavailable ? (
        <section className="standards-empty info-card" role="alert">
          <h2 id="api-heading">Developer readiness is unavailable</h2>
          <p>{result.unavailable}</p>
        </section>
      ) : (
        <>
          <section className="standards-readiness-intro">
            <p className="eyebrow">Developer readiness</p>
            <h2 id="api-heading">A safe starting point for release-aware clients.</h2>
            <p>Use the existing read-only API with an authorized client. {boundary}</p>
          </section>
          <section className="standards-api-quickstart" aria-labelledby="quickstart-heading">
            <h2 id="quickstart-heading">API quick start</h2>
            <pre>
              <code>{`GET /v1/standards/search?release=${result.releaseId}`}</code>
            </pre>
            <p>Authenticate through the existing API client. Never place credentials in a URL.</p>
          </section>
          <div className="standards-readiness-grid">
            <article className="standards-readiness-card">
              <h2>Compatibility</h2>
              <p>CASE export: denied</p>
              <p>Only release-bound metadata is available for inspection.</p>
            </article>
            <article className="standards-readiness-card">
              <h2>Safety boundary</h2>
              <p>
                {candidate
                  ? "Candidate-only · non-public · non-stable"
                  : "Stable · public · current"}
              </p>
              <p>
                Restricted text, source bytes, relationships, and artifacts stay out of this
                surface.
              </p>
            </article>
          </div>
        </>
      )}
    </section>
  );
}
