import { defaultStandardsRelease, type StandardsRecord } from "../../lib/standards-api";

export function StandardsResultCard({ record }: { record: StandardsRecord }) {
  const textAvailable = record.coverageState === "text-available" && Boolean(record.text);
  return (
    <article className="standards-result-card">
      <div className="standards-card-topline">
        <span className="record-meta">{record.nativeType ?? "Standard"}</span>
        <span className="standards-status">{record.status ?? "Candidate"}</span>
      </div>
      <h3>
        <a
          href={`/standards/items/${encodeURIComponent(record.id)}?release=${encodeURIComponent(record.releaseId ?? defaultStandardsRelease)}`}
        >
          {record.code ?? record.id}
        </a>
      </h3>
      {record.title && <p className="standards-card-title">{record.title}</p>}
      {record.frameworkId && (
        <p className="standards-card-framework">
          Framework:{" "}
          <a
            href={`/standards/frameworks/${encodeURIComponent(record.frameworkId)}?release=${encodeURIComponent(record.releaseId ?? defaultStandardsRelease)}`}
          >
            {record.frameworkTitle ?? record.frameworkId}
          </a>
        </p>
      )}
      {textAvailable ? (
        <p>{record.text}</p>
      ) : (
        <p className="standards-limited">
          Metadata only: official wording is not returned by this release.
        </p>
      )}
      <dl className="standards-card-meta">
        {record.frameworkId && (
          <>
            <dt>Framework</dt>
            <dd>{record.frameworkTitle ?? record.frameworkId}</dd>
          </>
        )}
        {record.jurisdiction && (
          <>
            <dt>Jurisdiction</dt>
            <dd>{record.jurisdiction}</dd>
          </>
        )}
        {record.subject && (
          <>
            <dt>Subject</dt>
            <dd>{record.subject}</dd>
          </>
        )}
        {record.stage && (
          <>
            <dt>Stage</dt>
            <dd>{record.stage}</dd>
          </>
        )}
        <dt>Trust</dt>
        <dd>
          {record.verificationStatus === "verified"
            ? "Source verified"
            : "Candidate / review state"}
        </dd>
        <dt>Rights</dt>
        <dd>
          {textAvailable ? `Text permitted (${record.rightsMode})` : "Rights-limited metadata"}
        </dd>
      </dl>
      <div className="standards-card-footer">
        <span>
          Provenance: {record.provenance ?? "Source record"}
          {record.sourceLocator ? ` · ${record.sourceLocator}` : ""}
        </span>
        {record.officialUrl && (
          <a href={record.officialUrl} target="_blank" rel="noreferrer">
            Open official source
          </a>
        )}
      </div>
    </article>
  );
}
