import {
  filterProjects,
  projectHealthLegend,
  projectMaturityLegend,
  projectStatusLegend,
  projects,
} from "@paper-and-slate/content";
import { ProjectCard } from "../../../components/project-card";
import { PageHeader } from "../../../components/page-primitives";

export default async function Projects({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    type?: string;
    status?: string;
    maturity?: string;
    health?: string;
    tag?: string;
    view?: string;
  }>;
}) {
  const filters = await searchParams;
  const visible = filterProjects(filters);
  const types = [...new Set(projects.map((project) => project.type))].sort();
  const tags = [...new Set(projects.flatMap((project) => project.tags))].sort();
  const listView = filters.view === "list";
  const viewHref = (view: "grid" | "list") => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries({ ...filters, view })) {
      if (typeof value === "string" && value.length > 0) params.set(key, value);
    }
    return `?${params.toString()}`;
  };
  return (
    <main id="main-content" className="page-wrap container">
      <PageHeader
        eyebrow="Projects / registry"
        title="Open building blocks for connected education."
      >
        The registry distinguishes maturity from maintenance health. Planned and unreleased work is
        labeled so this site never implies adoption or a finished standard.
      </PageHeader>
      <form className="filter-panel" method="get" aria-label="Filter projects">
        <label className="filter-search">
          Search projects
          <input
            name="q"
            type="search"
            defaultValue={filters.q ?? ""}
            placeholder="Name, tag, or description"
          />
        </label>
        <label>
          Type
          <select name="type" defaultValue={filters.type ?? ""}>
            <option value="">All types</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label>
          Maturity
          <select name="maturity" defaultValue={filters.maturity ?? ""}>
            <option value="">All maturity</option>
            {Object.keys(projectMaturityLegend).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label>
          Health
          <select name="health" defaultValue={filters.health ?? ""}>
            <option value="">All health</option>
            {Object.keys(projectHealthLegend).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label>
          Tag
          <select name="tag" defaultValue={filters.tag ?? ""}>
            <option value="">All tags</option>
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </label>
        <input type="hidden" name="view" value={filters.view ?? "grid"} />
        <button className="button button-dark" type="submit">
          Apply filters
        </button>
      </form>
      <div className="registry-toolbar">
        <p className="muted">
          Showing {visible.length} of {projects.length} projects.
        </p>
        <div className="view-toggle" aria-label="Project view">
          <a className={!listView ? "active" : ""} href={viewHref("grid")}>
            Cards
          </a>
          <a className={listView ? "active" : ""} href={viewHref("list")}>
            List
          </a>
        </div>
      </div>
      <details className="info-card status-legend">
        <summary>How to read project status</summary>
        <div className="legend-grid">
          <div>
            <h2>Maturity</h2>
            {Object.entries(projectMaturityLegend).map(([status, meaning]) => (
              <p key={status}>
                <strong>{status}</strong> — {meaning}
              </p>
            ))}
          </div>
          <div>
            <h2>Health</h2>
            {Object.entries(projectHealthLegend).map(([status, meaning]) => (
              <p key={status}>
                <strong>{status}</strong> — {meaning}
              </p>
            ))}
          </div>
          <div>
            <h2>Legacy release state</h2>
            {Object.entries(projectStatusLegend).map(([status, meaning]) => (
              <p key={status}>
                <strong>{status}</strong> — {meaning}
              </p>
            ))}
          </div>
        </div>
      </details>
      <h2 className="sr-only">Project records</h2>
      {visible.length > 0 ? (
        <div className={listView ? "project-list" : "project-grid"}>
          {visible.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      ) : (
        <article className="empty-state info-card">
          <h2>No projects match those filters.</h2>
          <p>Clear one or more filters to return to the complete public registry.</p>
          <a className="button button-light" href="/projects">
            Clear filters
          </a>
        </article>
      )}
    </main>
  );
}
