import Link from "next/link";
import Image from "next/image";
import type { Project } from "@paper-and-slate/content";
export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className={`project-card project-${project.slug}`}>
      <div className="project-media">
        {project.image ? (
          <Image
            src={project.image}
            alt={project.imageAlt ?? project.name}
            fill
            sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
          />
        ) : (
          <div className="project-media-fallback" aria-hidden="true" />
        )}
        <span className="media-provenance">Reference asset · rights review pending</span>
      </div>
      <div className="project-body">
        <span className="project-type">{project.type}</span>
        <h3>{project.name}</h3>
        <p>{project.summary}</p>
        <div className="card-footer">
          <span
            className="badge-row"
            role="status"
            aria-label={`Project maturity: ${project.maturity}; health: ${project.health}`}
          >
            <span className="status-badge">{project.maturity}</span>
            <span className="health-badge">{project.health}</span>
          </span>
          <Link href={`/projects/${project.slug}`}>View project →</Link>
        </div>
      </div>
    </article>
  );
}
