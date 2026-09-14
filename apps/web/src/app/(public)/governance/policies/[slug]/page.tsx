import { notFound } from "next/navigation";
import { getPolicy, policies } from "@paper-and-slate/content";
import { PageHeader } from "../../../../../components/page-primitives";
export function generateStaticParams() {
  return policies.map((p) => ({ slug: p.slug }));
}
export default async function Policy({ params }: { params: Promise<{ slug: string }> }) {
  const p = getPolicy((await params).slug);
  if (!p) notFound();
  return (
    <main id="main-content" className="page-wrap container">
      <PageHeader eyebrow={`${p.kind} · v${p.version}`} title={p.title}>
        {p.summary}
      </PageHeader>
      <article className="prose">
        <dl className="record-details">
          <dt>Owner</dt>
          <dd>{p.owner}</dd>
          <dt>Version</dt>
          <dd>{p.version}</dd>
          <dt>Effective</dt>
          <dd>{p.effectiveDate}</dd>
          <dt>Last reviewed</dt>
          <dd>{p.lastReviewed ?? "Not recorded"}</dd>
          <dt>Next review</dt>
          <dd>{p.nextReview ?? "Not recorded"}</dd>
        </dl>
        <p>{p.content}</p>
        <h2>Revision history</h2>
        {p.revisionHistory.length > 0 ? (
          <ul>
            {p.revisionHistory.map((revision) => (
              <li key={`${revision.version}-${revision.date}`}>
                v{revision.version} · {revision.date} — {revision.summary}
              </li>
            ))}
          </ul>
        ) : (
          <p>No revision history is recorded for this local policy.</p>
        )}
      </article>
    </main>
  );
}
