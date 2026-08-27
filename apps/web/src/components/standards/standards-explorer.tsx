import type { StandardsQuery, StandardsSearchResult } from "../../lib/standards-api";
import { StandardsResultCard } from "./standards-result-card";
import { StandardsSearchForm } from "./standards-search-form";

export function StandardsExplorer({
  values,
  result,
}: {
  values: StandardsQuery;
  result: StandardsSearchResult;
}) {
  const nextParams = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) if (value) nextParams.set(key, value);
  if (result.nextCursor) nextParams.set("cursor", result.nextCursor);
  return (
    <>
      <StandardsSearchForm values={values} />
      <div className="standards-release-notice" role="status">
        <strong>Release: {result.releaseId}</strong> —{" "}
        {result.candidateOnly
          ? "candidate preview; not a stable, current, or public release."
          : "published-release metadata returned by the synchronized API."}
      </div>
      {result.unavailable ? (
        <p className="standards-empty info-card">{result.unavailable}</p>
      ) : result.records.length === 0 ? (
        <section className="standards-empty info-card">
          <h2>No standards match these filters.</h2>
          <p>
            Try a broader search. Catalogued records may remain metadata-only while rights and
            publication review continue.
          </p>
        </section>
      ) : (
        <section aria-labelledby="standards-results-heading">
          <div className="standards-results-heading">
            <h2 id="standards-results-heading">Standards results</h2>
            <p className="muted">
              {result.records.length} records from the pinned candidate release.
            </p>
          </div>
          <div className="standards-results">
            {result.records.map((record) => (
              <StandardsResultCard key={record.id} record={record} />
            ))}
          </div>
          {result.hasMore && (
            <a
              className="button button-light standards-next"
              href={`/standards/explore?${nextParams}`}
            >
              Load more results
            </a>
          )}
        </section>
      )}
    </>
  );
}
