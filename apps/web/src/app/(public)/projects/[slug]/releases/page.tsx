import { notFound } from "next/navigation";
import Link from "next/link";
import { getProject, validatedReleases } from "@paper-and-slate/content";
export function generateStaticParams() {
  return validatedReleases.map((r) => ({ slug: r.project }));
}
export default async function Releases({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const releases = validatedReleases.filter((r) => r.project === slug);
  return (
    <main id="main-content" className="page-wrap container">
      <div className="page-header">
        <p className="eyebrow">Projects / Releases</p>
        <h1>{project.name} releases</h1>
        <p>
          {releases.length
            ? "Recorded release metadata for this project."
            : "No releases are recorded for this project."}
        </p>
      </div>
      <div className="card-grid">
        {releases.map((r) => (
          <article className="info-card" key={`${r.project}-${r.version}`}>
            <p className="record-meta">
              {r.status} · {r.version}
            </p>
            <p>{r.summary}</p>
          </article>
        ))}
      </div>
      <p>
        <Link href={`/projects/${slug}`}>Back to project</Link>
      </p>
    </main>
  );
}
