import type { StandardsSource, StandardsSourcesResult } from "../../lib/standards-api";

function value(value: unknown, fallback = "Not supplied by the projection") {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "boolean") return value ? "Available" : "Unavailable";
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
}

function rights(source: StandardsSource) {
  return Object.entries(source.rights).map(([key, state]) => (
    <li key={key}>
      <span>{key}</span>
      <strong>{state}</strong>
    </li>
  ));
}

function SourceCard({ source }: { source: StandardsSource }) {
  return (
    <article className="standards-source-card">
      <div className="standards-card-topline">
        <p className="standards-status">
          {source.candidateOnly ? "Candidate preview" : "Published"}
        </p>
        <span className="standards-source-id">{source.id}</span>
      </div>
      <h2>{value(source.name, "Unnamed source")}</h2>
      <p>
        <a
          href={`/standards/sources/${encodeURIComponent(source.id)}?release=${encodeURIComponent(source.releaseId)}`}
        >
          View source details
        </a>
      </p>
      <p className="standards-source-state">
        {source.fixtureOnly
          ? "Fixture-only metadata; authority is not verified."
          : "Source metadata"}
        {source.candidateOnly ? " This release is not a stable publication." : ""}
      </p>
      <dl className="standards-source-meta">
        <dt>Authority</dt>
        <dd>{value(source.authority)}</dd>
        <dt>Authority status</dt>
        <dd>{value(source.authorityStatus)}</dd>
        <dt>Source role</dt>
        <dd>{value(source.role)}</dd>
        <dt>Release</dt>
        <dd>{source.releaseId}</dd>
        <dt>Snapshot</dt>
        <dd>{value(source.snapshotId)}</dd>
        <dt>As of</dt>
        <dd>{value(source.asOfDate)}</dd>
        <dt>Format</dt>
        <dd>{value(source.format)}</dd>
      </dl>
      <section aria-labelledby={`rights-${source.id}`}>
        <h3 id={`rights-${source.id}`}>Rights summary</h3>
        <ul className="standards-source-rights">{rights(source)}</ul>
      </section>
      <section className="standards-source-provenance" aria-labelledby={`provenance-${source.id}`}>
        <h3 id={`provenance-${source.id}`}>Provenance</h3>
        <p>
          {value(source.provenance?.kind, "Provenance kind not supplied")}
          {source.provenance?.jsonPointer ? ` · ${source.provenance.jsonPointer}` : ""}
        </p>
        <p>Source release: {value(source.provenance?.sourceReleaseId)}</p>
      </section>
      <div className="standards-source-links">
        {source.officialUrl ? (
          <a href={source.officialUrl} target="_blank" rel="noreferrer">
            Official source ({source.officialDomain})
          </a>
        ) : (
          <span>Official URL/domain not supplied by the projection</span>
        )}
        {source.frameworkId ? (
          <a
            href={`/standards/frameworks/${encodeURIComponent(source.frameworkId)}?release=${encodeURIComponent(source.releaseId)}`}
          >
            View framework
          </a>
        ) : null}
      </div>
      <p className="standards-limited">
        Metadata only. Restricted wording and source bytes are not displayed.
      </p>
    </article>
  );
}

export function StandardsSources({ result }: { result: StandardsSourcesResult }) {
  return (
    <section className="standards-sources" aria-labelledby="standards-sources-heading">
      <div className="standards-release-notice" role="status">
        Release: {result.releaseId} ·{" "}
        {result.candidateOnly
          ? "candidate preview; not a stable or current publication"
          : "published release"}
      </div>
      {result.unavailable ? (
        <section className="standards-empty info-card" role="alert">
          <h2 id="standards-sources-heading">Sources are unavailable</h2>
          <p>{result.unavailable}</p>
        </section>
      ) : result.sources.length === 0 ? (
        <section className="standards-empty info-card">
          <h2 id="standards-sources-heading">No sources in this release</h2>
          <p>
            The pinned projection supplied no source metadata. No source authority or rights are
            inferred.
          </p>
        </section>
      ) : (
        <>
          <div className="standards-results-heading">
            <h2 id="standards-sources-heading">Source directory</h2>
            <span>
              {result.sources.length} source{result.sources.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="standards-source-list">
            {result.sources.map((source) => (
              <SourceCard key={source.id} source={source} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
