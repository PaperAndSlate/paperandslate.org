import { searchLocal, searchStatus } from "../../../lib/search";
import { PageHeader } from "../../../components/page-primitives";
import Link from "next/link";

const groups = [
  "project",
  "documentation",
  "news",
  "governance",
  "rfc",
  "decision",
  "policy",
  "report",
];
const labels: Record<string, string> = {
  project: "Projects",
  documentation: "Documentation",
  news: "News",
  governance: "Governance",
  rfc: "RFCs",
  decision: "Decisions",
  policy: "Policies",
  report: "Reports",
};

export default async function Search({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").slice(0, 120);
  const response = await searchLocal(q, {
    filters: { type: groups.includes(params.type ?? "") ? (params.type as never) : undefined },
  });
  const grouped = response.results.reduce<Record<string, typeof response.results>>(
    (result, item) => {
      (result[item.type] ??= []).push(item);
      return result;
    },
    {},
  );
  return (
    <main id="main-content" className="page-wrap container">
      <PageHeader eyebrow="Search / public index" title="Find the work.">
        Search covers the public project registry, reviewed documentation, governance records, news,
        and policies. Results remain available through the local index when hosted search is
        unavailable.
      </PageHeader>
      <form className="search-box search-page-form" method="get" role="search">
        <label className="sr-only" htmlFor="site-search">
          Search the public index
        </label>
        <input
          id="site-search"
          name="q"
          defaultValue={q}
          placeholder="Search the site"
          maxLength={120}
        />
        <label className="sr-only" htmlFor="site-search-type">
          Filter by content type
        </label>
        <select id="site-search-type" name="type" defaultValue={params.type ?? ""}>
          <option value="">All content</option>
          {groups.map((type) => (
            <option key={type} value={type}>
              {labels[type]}
            </option>
          ))}
        </select>
        <button className="button button-dark" type="submit">
          Search
        </button>
      </form>
      <div className="search-summary">
        <p>
          {q ? (
            <>
              {response.total} result{response.total === 1 ? "" : "s"} for “{q}”.
            </>
          ) : (
            "Enter a query to search the public index."
          )}
        </p>
        <p className="record-meta">
          Provider: {response.provider.replace("-fallback", "")} · Index:{" "}
          {response.indexId ?? searchStatus.indexId}
          {response.degraded ? " · degraded fallback" : ""}
        </p>
      </div>
      {q && response.total === 0 ? (
        <article className="empty-state info-card">
          <h2>No matching records</h2>
          <p>Try a project name, RFC number, or broader phrase.</p>
        </article>
      ) : null}
      <div className="search-results">
        {Object.entries(grouped).map(([type, items]) => (
          <section key={type} className="search-result-group" aria-labelledby={`result-${type}`}>
            <div className="section-heading">
              <h2 id={`result-${type}`}>{labels[type] ?? type}</h2>
              <span className="muted">{items.length}</span>
            </div>
            <div className="card-grid">
              {items.map((result) => (
                <article className="info-card search-result-card" key={result.id}>
                  <p className="record-meta">
                    {result.type} · score {result.score}
                  </p>
                  <h3>
                    <Link href={result.route}>{result.title}</Link>
                  </h3>
                  <p>{result.snippet}</p>
                  <Link href={result.route}>View result →</Link>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
