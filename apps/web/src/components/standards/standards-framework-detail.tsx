import type { StandardsFrameworkDetail } from "../../lib/standards-api";

function list(values: string[]) {
  return values.length > 0 ? values.join(", ") : "Not reported by this release";
}

export function StandardsFrameworkDetail({ detail }: { detail: StandardsFrameworkDetail }) {
  if (detail.unavailable) {
    return (
      <div className="standards-detail">
        <p className="standards-empty info-card">{detail.unavailable}</p>
        <nav aria-label="Standards navigation">
          <a className="button button-light" href="/standards/explore">
            Back to Explore
          </a>
        </nav>
      </div>
    );
  }
  const title = detail.title ?? detail.name ?? detail.id;
  return (
    <div className="standards-detail">
      <header className="standards-detail-header">
        <div className="standards-detail-kicker">
          <span>Framework</span>
          <span>{detail.status}</span>
          <span>Release {detail.releaseId}</span>
        </div>
        <h1>{title}</h1>
        <p>
          A source-backed framework projection with its native structure, release identity, and
          publication limits kept visible.
        </p>
        {detail.candidateOnly && (
          <p className="standards-detail-notice" role="status">
            <strong>Candidate preview.</strong> This is not a stable, current, or public release.
          </p>
        )}
        <nav aria-label="Standards navigation">
          <a className="button button-light" href="/standards/explore">
            Back to Explore
          </a>
        </nav>
      </header>

      <div className="standards-detail-grid">
        <section className="standards-detail-section" aria-labelledby="framework-overview">
          <h2 id="framework-overview">Overview</h2>
          <p>
            {detail.overview ?? "No public framework description is available in this projection."}
          </p>
          <dl className="standards-detail-meta">
            <dt>Jurisdiction</dt>
            <dd>{detail.jurisdiction ?? "Not reported"}</dd>
            <dt>Authority</dt>
            <dd>{detail.authority ?? "Not reported"}</dd>
            <dt>Subject</dt>
            <dd>{detail.subject ?? list(detail.subjects)}</dd>
            <dt>Stage</dt>
            <dd>{detail.stage ?? list(detail.stages)}</dd>
            <dt>Framework status</dt>
            <dd>{detail.status}</dd>
          </dl>
        </section>

        <section className="standards-detail-section" aria-labelledby="framework-trust">
          <h2 id="framework-trust">Trust and rights</h2>
          <dl className="standards-detail-meta">
            <dt>Verification</dt>
            <dd>{detail.verificationStatus ?? "Candidate / review state"}</dd>
            <dt>Rights state</dt>
            <dd>{detail.rightsMode ?? "Rights-limited metadata"}</dd>
            <dt>API access</dt>
            <dd>{detail.rightsApi ?? "Metadata only"}</dd>
            <dt>Availability</dt>
            <dd>{detail.availability ?? "Metadata-only projection"}</dd>
            <dt>Provenance</dt>
            <dd>{detail.provenance ?? "Source record"}</dd>
          </dl>
          <p className="standards-limited">
            Restricted wording and source bytes are not displayed.
          </p>
        </section>
      </div>

      <section
        className="standards-detail-section"
        id="hierarchy"
        aria-labelledby="framework-hierarchy"
      >
        <h2 id="framework-hierarchy">Native hierarchy</h2>
        <p>
          {detail.nodeCount ?? detail.tree.length} structural records ·{" "}
          {detail.hierarchy?.rootCount ?? 0} roots · maximum depth {detail.hierarchy?.maxDepth ?? 0}
        </p>
        <ul className="standards-detail-links">
          {detail.nativeTypes.map((value) => (
            <li key={`type-${value}`}>
              <a href="#hierarchy">Native type: {value}</a>
            </li>
          ))}
          {detail.stages.map((value) => (
            <li key={`stage-${value}`}>
              <a href="#hierarchy">Stage: {value}</a>
            </li>
          ))}
          {detail.subjects.map((value) => (
            <li key={`subject-${value}`}>
              <a href="#hierarchy">Subject: {value}</a>
            </li>
          ))}
        </ul>
        {detail.tree.length > 0 ? (
          <>
            <ul className="standards-detail-tree">
              {detail.tree.slice(0, 12).map((node) => (
                <li key={node.id}>
                  <a
                    href={`/standards/items/${encodeURIComponent(node.id)}?release=${encodeURIComponent(detail.releaseId)}`}
                  >
                    {node.code ?? node.id}
                    {node.title ? ` — ${node.title}` : ""}
                  </a>
                </li>
              ))}
            </ul>
            {detail.tree.length > 12 && (
              <p className="standards-limited">
                Showing the first 12 structural records in this preview.
              </p>
            )}
          </>
        ) : (
          <p className="standards-limited">
            The tree projection contains metadata only or is not available for this release.
          </p>
        )}
      </section>

      <div className="standards-detail-grid">
        <section className="standards-detail-section" aria-labelledby="framework-versions">
          <h2 id="framework-versions">Versions</h2>
          <ul className="standards-detail-tree">
            {detail.versions.length > 0 ? (
              detail.versions.map((version) => (
                <li key={version.id}>
                  {version.title ?? version.id} · {detail.releaseId} · candidate
                </li>
              ))
            ) : (
              <li>No version metadata is available.</li>
            )}
          </ul>
        </section>
        <section className="standards-detail-section" aria-labelledby="framework-source">
          <h2 id="framework-source">Source record</h2>
          <dl className="standards-detail-meta">
            <dt>Locator</dt>
            <dd>{detail.sourceLocator ?? "Not reported"}</dd>
            <dt>Release</dt>
            <dd>{detail.releaseId}</dd>
          </dl>
          {detail.officialUrl && (
            <a href={detail.officialUrl} target="_blank" rel="noreferrer">
              Open permitted official source
            </a>
          )}
        </section>
      </div>
    </div>
  );
}
