import Link from "next/link";
import { PageHeader } from "../../../components/page-primitives";
import { docs } from "../../../lib/docs";
import { DocsProjectSelector } from "../../../components/docs-project-selector";
export const dynamic = "force-static";
export default async function Docs({
  searchParams,
}: {
  searchParams?: Promise<{ topic?: string; project?: string }>;
}) {
  const params = await searchParams;
  const topic = params?.topic;
  const project = params?.project;
  const visible = docs
    .filter(
      (doc) =>
        (!project || doc.project === project) &&
        (!topic ||
          doc.taxonomy.includes(topic) ||
          doc.sourcePath.toLowerCase().includes(topic) ||
          doc.content.toLowerCase().includes(topic)),
    )
    .filter((doc) => (topic || project ? true : doc.sourcePath.endsWith("index.md")));
  const sections = [
    ["Getting started", "/docs/getting-started"],
    ["Concepts", "/docs/concepts"],
    ["Guides", "/docs/guides"],
    ["Reference", "/docs/reference"],
    ["Tools", "/docs/tools"],
    ["Governance", "/docs/governance"],
  ];

  return (
    <main id="main-content" className="prose">
      <PageHeader eyebrow="Documentation" title="Read the work as it develops.">
        Local pages are built from reviewed Markdown with visible version and provenance metadata.
      </PageHeader>
      <nav aria-label="Documentation sections" className="card-grid">
        {sections.map(([label, href]) => (
          <article className="info-card" key={href}>
            <h2>
              <Link href={href}>{label}</Link>
            </h2>
            <p>Browse the ingested documents in this section.</p>
          </article>
        ))}
      </nav>
      <DocsProjectSelector documents={docs} current={project} />
      {(topic || project) && (
        <p>
          Filtered
          {project && (
            <>
              {" "}
              project: <strong>{project}</strong>
            </>
          )}
          {topic && (
            <>
              {" "}
              topic: <strong>{topic}</strong>
            </>
          )}{" "}
          · <Link href="/docs">Clear filters</Link>
        </p>
      )}
      <div className="card-grid">
        {visible.map((doc) => (
          <article className="info-card" key={doc.id}>
            <p className="eyebrow">
              {doc.status} · {doc.version} · {doc.taxonomy.join(", ")}
            </p>
            <h2>
              <Link href={doc.canonicalRoute}>{doc.title}</Link>
            </h2>
            <p>{doc.description}</p>
            <p className="muted">
              Source: {doc.sourceId} · {doc.ref}
            </p>
          </article>
        ))}
      </div>
    </main>
  );
}
