import type { StandardsChangesResult } from "../../lib/standards-api";

export function StandardsChanges({ result }: { result: StandardsChangesResult }) {
  if (result.unavailable)
    return (
      <section className="standards-detail">
        <p className="standards-empty info-card">{result.unavailable}</p>
        <p className="standards-disclaimer">
          Fixture-only · rights denied · non-public · no full text · no raw bytes.
        </p>
      </section>
    );
  return (
    <section className="standards-detail" aria-labelledby="changes-heading">
      <div className="section-heading">
        <p className="eyebrow">Candidate history</p>
        <h2 id="changes-heading">Iowa Mathematics changes</h2>
        <p>
          Metadata-only synthetic history for release <code>{result.releaseId}</code>. It does not
          represent official wording or equivalence.
        </p>
      </div>
      <div className="standards-change-list">
        {result.changes.map((change) => (
          <article className="info-card" key={change.id}>
            <p className="eyebrow">
              {change.changeClass === "issuer-change" ? "Issuer change" : "Processing correction"}
            </p>
            <h3>
              {change.fromCandidateReleaseId} → {change.toCandidateReleaseId}
            </h3>
            <p>Candidate metadata only; historical identities remain distinct.</p>
            {change.sourceLocator && (
              <p>
                <strong>Source locator:</strong> <code>{change.sourceLocator}</code>
              </p>
            )}
          </article>
        ))}
      </div>
      <p className="standards-disclaimer">
        Fixture-only · rights denied · non-public · no full text · no raw bytes.
      </p>
    </section>
  );
}
