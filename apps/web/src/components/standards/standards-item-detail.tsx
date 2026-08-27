import { Fragment } from "react";
import type { StandardsItemDetail, StandardsRecord } from "../../lib/standards-api";

function label(record: StandardsRecord) {
  return `${record.code ?? record.id}${record.title ? ` — ${record.title}` : ""}`;
}

function RecordLinks({
  records,
  heading,
  releaseId,
}: {
  records: StandardsRecord[];
  heading: string;
  releaseId: string;
}) {
  return (
    <section className="standards-detail-section" aria-labelledby={heading.toLowerCase()}>
      <h2 id={heading.toLowerCase()}>{heading}</h2>
      {records.length ? (
        <ul className="standards-detail-tree">
          {records.map((record) => (
            <li key={record.id}>
              <a
                href={`/standards/items/${encodeURIComponent(record.id)}?release=${encodeURIComponent(releaseId)}`}
              >
                {label(record)}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="standards-limited">No relationship records are available in this release.</p>
      )}
    </section>
  );
}

export function StandardsItemDetail({ detail }: { detail: StandardsItemDetail }) {
  if (detail.unavailable) {
    return (
      <div className="standards-detail">
        <p className="standards-empty info-card" role="status">
          {detail.unavailable}
        </p>
        <nav aria-label="Standards navigation">
          <a className="button button-light" href="/standards/explore">
            Back to Explore
          </a>
        </nav>
      </div>
    );
  }
  const { record } = detail;
  const textAvailable = record.coverageState === "text-available" && Boolean(record.text);
  const locator = detail.provenance.sourceLocator;
  return (
    <div className="standards-detail standards-item-detail">
      <header className="standards-detail-header">
        <div className="standards-detail-kicker">
          <span>{record.nativeType ?? "Standard item"}</span>
          <span>{record.status ?? "Candidate"}</span>
          <span>Release {detail.releaseId}</span>
        </div>
        <h1>{record.code ?? record.id}</h1>
        {record.title && <p className="standards-item-title">{record.title}</p>}
        <p>
          A source-backed node projection with its native structure, hierarchy, provenance, and
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
          {record.frameworkId && (
            <a
              className="button button-light"
              href={`/standards/frameworks/${encodeURIComponent(record.frameworkId)}?release=${encodeURIComponent(detail.releaseId)}`}
            >
              Open framework
            </a>
          )}
        </nav>
      </header>

      <div className="standards-detail-grid">
        <section className="standards-detail-section" aria-labelledby="item-structure">
          <h2 id="item-structure">Node structure</h2>
          <dl className="standards-detail-meta">
            <dt>Code</dt>
            <dd>{record.code ?? record.id}</dd>
            <dt>Title</dt>
            <dd>{record.title ?? "Not reported"}</dd>
            <dt>Native type</dt>
            <dd>{record.nativeType ?? "Not reported"}</dd>
            <dt>Jurisdiction</dt>
            <dd>{record.jurisdiction ?? "Not reported"}</dd>
            <dt>Subject</dt>
            <dd>{record.subject ?? "Not reported"}</dd>
            <dt>Stage</dt>
            <dd>{record.stage ?? "Not reported"}</dd>
            <dt>Framework</dt>
            <dd>{record.frameworkTitle ?? record.frameworkId ?? "Not reported"}</dd>
          </dl>
          {record.nativeStructure && Object.keys(record.nativeStructure).length > 0 && (
            <>
              <h3>Native fields</h3>
              <dl className="standards-detail-meta">
                {Object.entries(record.nativeStructure).map(([key, value]) => (
                  <Fragment key={key}>
                    <dt>{key}</dt>
                    <dd>{value}</dd>
                  </Fragment>
                ))}
              </dl>
            </>
          )}
          {textAvailable ? (
            <p className="standards-item-text">{record.text}</p>
          ) : (
            <p className="standards-limited">
              Metadata only: official wording is not returned by this release.
            </p>
          )}
        </section>
        <section className="standards-detail-section" aria-labelledby="item-trust">
          <h2 id="item-trust">Trust, rights, and availability</h2>
          <dl className="standards-detail-meta">
            <dt>Verification</dt>
            <dd>{record.verificationStatus ?? "Candidate / review state"}</dd>
            <dt>Rights</dt>
            <dd>
              {detail.rights.fullText === "public-api" && textAvailable
                ? "Full text permitted (public-api)"
                : "Rights-limited metadata"}
            </dd>
            <dt>API access</dt>
            <dd>{detail.rights.api ?? "denied"}</dd>
            <dt>Full text</dt>
            <dd>{detail.availability.fullText && textAvailable ? "Available" : "Unavailable"}</dd>
            <dt>Raw bytes</dt>
            <dd>Unavailable</dd>
            <dt>Release identity</dt>
            <dd>{detail.releaseId}</dd>
          </dl>
          <p className="standards-limited">
            Restricted wording, raw bytes, internal hashes, and secrets are not displayed.
          </p>
        </section>
      </div>

      <div className="standards-detail-grid">
        <RecordLinks records={detail.ancestors} heading="Ancestors" releaseId={detail.releaseId} />
        <RecordLinks records={detail.children} heading="Children" releaseId={detail.releaseId} />
      </div>
      <section className="standards-detail-section" aria-labelledby="item-provenance">
        <h2 id="item-provenance">Provenance</h2>
        <dl className="standards-detail-meta">
          <dt>Source release</dt>
          <dd>{detail.provenance.sourceReleaseId ?? "Not reported"}</dd>
          <dt>Candidate release</dt>
          <dd>{detail.provenance.candidateReleaseId ?? detail.releaseId}</dd>
          <dt>Snapshot</dt>
          <dd>{detail.provenance.snapshotId ?? "Not reported"}</dd>
          <dt>Manifest</dt>
          <dd>{detail.provenance.manifestId ?? "Not reported"}</dd>
          <dt>Source locator</dt>
          <dd>
            {[locator?.kind, locator?.jsonPointer, locator?.locator].filter(Boolean).join(" · ") ||
              "Not reported"}
          </dd>
        </dl>
        {record.officialUrl && (
          <a href={record.officialUrl} target="_blank" rel="noreferrer">
            Open official source
          </a>
        )}
      </section>
    </div>
  );
}
