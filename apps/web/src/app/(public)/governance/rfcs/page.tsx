import Link from "next/link";
import { filterRfcs, rfcs, type RfcFilters } from "@paper-and-slate/content";
import { PageHeader } from "../../../../components/page-primitives";

export default async function Rfcs({ searchParams }: { searchParams?: Promise<RfcFilters> }) {
  const filters = (await searchParams) ?? {};
  const visible = filterRfcs(rfcs, filters);
  const statuses = [...new Set(rfcs.map((rfc) => rfc.status))].sort();
  const projects = [...new Set(rfcs.flatMap((rfc) => rfc.projects))].sort();
  return (
    <main id="main-content" className="page-wrap container">
      <PageHeader eyebrow="Governance" title="Requests for comment">
        RFCs record proposals and their lifecycle.
      </PageHeader>
      <form className="filter-panel" method="get" aria-label="Filter RFCs">
        <label className="filter-search">
          Search RFCs
          <input
            name="q"
            type="search"
            defaultValue={filters.q ?? ""}
            placeholder="Title, author, or project"
          />
        </label>
        <label>
          Status
          <select name="status" defaultValue={filters.status ?? ""}>
            <option value="">All statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label>
          Project
          <select name="project" defaultValue={filters.project ?? ""}>
            <option value="">All projects</option>
            {projects.map((project) => (
              <option key={project} value={project}>
                {project}
              </option>
            ))}
          </select>
        </label>
        <button className="button button-dark" type="submit">
          Apply filters
        </button>
      </form>
      <p className="muted">
        Showing {visible.length} of {rfcs.length} RFCs.
      </p>
      {visible.length > 0 ? (
        <div className="card-grid">
          {visible.map((r) => (
            <article className="info-card" key={r.number}>
              <p className="record-meta">
                RFC {r.number} · {r.status} · {r.year}
              </p>
              <h2>{r.title}</h2>
              <p>{r.summary}</p>
              <dl className="record-details">
                <dt>Authors</dt>
                <dd>{r.authors.join(", ")}</dd>
                <dt>Affected projects</dt>
                <dd>{r.projects.length > 0 ? r.projects.join(", ") : r.scope}</dd>
                <dt>Review deadline</dt>
                <dd>{r.reviewDeadline ?? "Not recorded"}</dd>
                <dt>Last updated</dt>
                <dd>{r.lastUpdated ?? r.published}</dd>
              </dl>
              <Link href={r.canonicalUrl}>Read RFC →</Link>
            </article>
          ))}
        </div>
      ) : (
        <article className="empty-state info-card">
          <h2>No RFCs match those filters.</h2>
          <a className="button button-light" href="/governance/rfcs">
            Clear filters
          </a>
        </article>
      )}
    </main>
  );
}
