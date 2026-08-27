import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, projects } from "@paper-and-slate/content";
import { PageHeader } from "../../../../components/page-primitives";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const project = getProject((await params).slug);
  return project
    ? {
        title: project.name,
        description: project.summary,
        alternates: { canonical: `/projects/${project.slug}` },
      }
    : {};
}

export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}

export default async function ProjectDetail({ params }: { params: Promise<{ slug: string }> }) {
  const project = getProject((await params).slug);
  if (!project) notFound();
  return (
    <main id="main-content" className="page-wrap container">
      <div className="detail-hero">
        <div>
          <PageHeader eyebrow={`Projects / ${project.type}`} title={project.name}>
            {project.summary}
          </PageHeader>
          <div className="badge-row">
            <span className="status-badge">{project.maturity}</span>
            <span className="health-badge">{project.health}</span>
            <span className="release-badge">{project.releaseState}</span>
          </div>
        </div>
        {project.image ? (
          <figure className="detail-media">
            <Image
              src={project.image}
              alt={project.imageAlt ?? project.name}
              fill
              priority
              sizes="(max-width: 800px) 100vw, 40vw"
            />
            <figcaption>Reference asset · rights review pending</figcaption>
          </figure>
        ) : null}
      </div>
      <div className="detail-grid">
        <article className="prose">
          <p>{project.details}</p>
          <h2>Overview</h2>
          <ul>
            {project.overview.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h2>Interoperability</h2>
          <p>{project.interoperability.join(" ")}</p>
          <h2>Relationships</h2>
          {project.relationships.length > 0 ? (
            <ul>
              {project.relationships.map((relationship) => (
                <li key={`${relationship.project}-${relationship.label}`}>
                  {relationship.label}:{" "}
                  <Link href={`/projects/${relationship.project}`}>{relationship.project}</Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>No related project records are currently declared.</p>
          )}
          <h2>Public record</h2>
          <p>
            This registry entry is maintained by the Paper &amp; Slate initiative of Glasscow LLC.
            It is a project record, not a claim of external adoption, accreditation, or
            institutional endorsement.
          </p>
        </article>
        <aside className="metadata-panel info-card">
          <h2>Project record</h2>
          <dl>
            <dt>Maturity</dt>
            <dd>{project.maturity}</dd>
            <dt>Health</dt>
            <dd>{project.health}</dd>
            <dt>Legacy status</dt>
            <dd>{project.status}</dd>
            <dt>Version</dt>
            <dd>{project.version ?? "No released version"}</dd>
            <dt>Last meaningful update</dt>
            <dd>{project.lastMeaningfulUpdate}</dd>
            <dt>Maintainers</dt>
            <dd>{project.maintainers.join(", ")}</dd>
            <dt>License</dt>
            <dd>
              {project.licenses.length > 0
                ? project.licenses.join(", ")
                : "Not yet assigned; review pending"}
            </dd>
            <dt>Source</dt>
            <dd>
              {project.repository ? (
                <a href={project.repository} rel="noreferrer">
                  Repository
                </a>
              ) : (
                "Forgejo source link pending"
              )}
            </dd>
            <dt>Documentation</dt>
            <dd>
              <Link href={project.docsRoot}>Browse docs</Link>
            </dd>
          </dl>
          <Link className="button button-light" href={`/projects/${project.slug}/releases`}>
            View release history
          </Link>
        </aside>
      </div>
    </main>
  );
}
