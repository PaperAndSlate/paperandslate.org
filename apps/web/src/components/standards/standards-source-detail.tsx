import { Fragment } from "react";
import type { StandardsSourceDetail } from "../../lib/standards-api";

function value(input: unknown) {
  return typeof input === "string" && input.trim() ? input : "Not reported";
}

function Metadata({ detail }: { detail: StandardsSourceDetail }) {
  return (
    <div className="standards-detail-grid">
      <section className="standards-detail-section" aria-labelledby="source-metadata">
        <h2 id="source-metadata">Source metadata</h2>
        <dl className="standards-detail-meta">
          <dt>Authority</dt>
          <dd>{value(detail.authority)}</dd>
          <dt>Authority status</dt>
          <dd>{value(detail.authorityStatus)}</dd>
          <dt>Source role</dt>
          <dd>{value(detail.role)}</dd>
          <dt>Release</dt>
          <dd>{detail.releaseId}</dd>
          <dt>Status</dt>
          <dd>{value(detail.status)}</dd>
          <dt>Snapshot</dt>
          <dd>{value(detail.snapshotId)}</dd>
          <dt>As of</dt>
          <dd>{value(detail.asOfDate)}</dd>
          <dt>Format</dt>
          <dd>{value(detail.format)}</dd>
          <dt>Framework</dt>
          <dd>{value(detail.frameworkTitle ?? detail.frameworkId)}</dd>
        </dl>
      </section>
      <section className="standards-detail-section" aria-labelledby="source-rights">
        <h2 id="source-rights">Rights and availability</h2>
        <dl className="standards-detail-meta">
          {Object.entries(detail.rights).map(([key, state]) => (
            <Fragment key={key}>
              <dt>{key}</dt>
              <dd>{state}</dd>
            </Fragment>
          ))}
          <dt>Metadata</dt>
          <dd>{detail.availability.metadata ? "Available" : "Unavailable"}</dd>
          <dt>Full text</dt>
          <dd>{detail.availability.fullText ? "Available" : "Unavailable"}</dd>
          <dt>Raw bytes</dt>
          <dd>Unavailable</dd>
        </dl>
        <p className="standards-limited">
          Metadata only. Restricted wording and source bytes are not displayed.
        </p>
      </section>
    </div>
  );
}

export function StandardsSourceDetail({ detail }: { detail: StandardsSourceDetail }) {
  if (detail.unavailable) {
    return (
      <div className="standards-detail">
        <nav aria-label="Standards navigation">
          <a className="button button-light" href="/standards/sources">
            Back to sources
          </a>
        </nav>
        <p className="standards-empty info-card" role="alert">
          {detail.unavailable}
        </p>
      </div>
    );
  }
  const locator = detail.sourceLocator;
  return (
    <div className="standards-detail standards-source-detail">
      <header className="standards-detail-header">
        <div className="standards-detail-kicker">
          <span>Source</span>
          <span>{detail.candidateOnly ? "Candidate preview" : "Published"}</span>
          <span>Release {detail.releaseId}</span>
        </div>
        <h1>{value(detail.name)}</h1>
        <p>{detail.id}</p>
        <p className="standards-detail-notice" role="status">
          <strong>
            {detail.fixtureOnly
              ? "Fixture-only metadata."
              : detail.candidateOnly
                ? "Candidate source metadata."
                : "Published source metadata."}
          </strong>{" "}
          Authority, rights, and publication state are shown exactly as projected; restricted source
          bytes are not displayed.
        </p>
        <nav aria-label="Standards navigation">
          <a className="button button-light" href="/standards/sources">
            Back to sources
          </a>
          {detail.frameworkId && (
            <a
              className="button button-light"
              href={`/standards/frameworks/${encodeURIComponent(detail.frameworkId)}?release=${encodeURIComponent(detail.releaseId)}`}
            >
              Open framework
            </a>
          )}
        </nav>
      </header>
      <Metadata detail={detail} />
      <section className="standards-detail-section" aria-labelledby="source-provenance">
        <h2 id="source-provenance">Provenance</h2>
        <dl className="standards-detail-meta">
          <dt>Source release</dt>
          <dd>{value(detail.sourceReleaseId)}</dd>
          <dt>Candidate release</dt>
          <dd>{value(detail.candidateReleaseId)}</dd>
          <dt>Snapshot</dt>
          <dd>{value(detail.snapshotId)}</dd>
          <dt>Manifest</dt>
          <dd>{value(detail.manifestId)}</dd>
          <dt>Parser</dt>
          <dd>{value(detail.parserVersion)}</dd>
          <dt>Mapping</dt>
          <dd>{value(detail.mappingVersion)}</dd>
          <dt>Normalization</dt>
          <dd>{value(detail.normalizationVersion)}</dd>
          <dt>Validation</dt>
          <dd>{value(detail.validationVersion)}</dd>
          <dt>Source locator</dt>
          <dd>
            {[locator?.kind, locator?.path, locator?.jsonPointer, locator?.locator]
              .filter(Boolean)
              .join(" · ") || "Not reported"}
          </dd>
        </dl>
        {detail.artifactSha256 && <p>Artifact identity: {detail.artifactSha256}</p>}
      </section>
      {detail.officialUrl && (
        <p>
          <a href={detail.officialUrl} target="_blank" rel="noreferrer">
            Open official source ({detail.officialDomain})
          </a>
        </p>
      )}
    </div>
  );
}
