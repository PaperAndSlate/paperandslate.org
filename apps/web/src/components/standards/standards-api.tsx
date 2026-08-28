import type { StandardsApiReadinessResult } from "../../lib/standards-api";

export function StandardsApi({ result }: { result: StandardsApiReadinessResult }) {
  return (
    <section className="standards-readiness" aria-labelledby="api-heading">
      <div className="standards-release-notice" role="status">
        <strong>Release: {result.releaseId}</strong> — candidate preview; not public, stable,
        current, or publishable. Rights status: denied; API availability is metadata-only.
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
            <p>
              Use the existing read-only API with an authorized client. The selected candidate
              release is metadata-only, and no stable or public contract is implied.
            </p>
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
              <p>Candidate-only · non-public · non-stable</p>
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
