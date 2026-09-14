import { notFound } from "next/navigation";
import Link from "next/link";
import { getDecision, getRfc, rfcs } from "@paper-and-slate/content";
import { PageHeader } from "../../../../../components/page-primitives";
export function generateStaticParams() {
  return rfcs.map((r) => ({ number: String(r.number) }));
}
export default async function Rfc({ params }: { params: Promise<{ number: string }> }) {
  const r = getRfc(Number((await params).number));
  if (!r) notFound();
  const decision = r.decisionId ? getDecision(r.decisionId) : undefined;
  return (
    <main id="main-content" className="page-wrap container">
      <PageHeader eyebrow={`RFC ${r.number} · ${r.status}`} title={r.title}>
        {r.summary}
      </PageHeader>
      <article className="prose">
        <dl className="record-details">
          <dt>Authors</dt>
          <dd>{r.authors.join(", ")}</dd>
          <dt>Sponsor</dt>
          <dd>{r.sponsor}</dd>
          <dt>Owner</dt>
          <dd>{r.owner}</dd>
          <dt>Scope</dt>
          <dd>{r.scope}</dd>
          <dt>Affected projects</dt>
          <dd>{r.projects.length > 0 ? r.projects.join(", ") : "None recorded"}</dd>
          <dt>Published</dt>
          <dd>{r.published}</dd>
          <dt>Review deadline</dt>
          <dd>{r.reviewDeadline ?? "Not recorded"}</dd>
          <dt>Last updated</dt>
          <dd>{r.lastUpdated ?? r.published}</dd>
        </dl>
        <p>{r.content}</p>
        <h2>References</h2>
        <ul>
          <li>
            Discussion:{" "}
            {r.discussionUrl ? <a href={r.discussionUrl}>Open discussion</a> : "Not recorded"}
          </li>
          <li>
            Decision:{" "}
            {decision ? <Link href={decision.canonicalUrl}>{decision.id}</Link> : "Not recorded"}
          </li>
        </ul>
      </article>
    </main>
  );
}
