import { notFound } from "next/navigation";
import Link from "next/link";
import { decisions, getDecision, getRfc } from "@paper-and-slate/content";
import { PageHeader } from "../../../../../components/page-primitives";
export function generateStaticParams() {
  return decisions.map((d) => ({ id: d.id }));
}
export default async function Decision({ params }: { params: Promise<{ id: string }> }) {
  const d = getDecision((await params).id);
  if (!d) notFound();
  return (
    <main id="main-content" className="page-wrap container">
      <PageHeader eyebrow={`${d.id} · ${d.date}`} title={d.title}>
        {d.summary}
      </PageHeader>
      <article className="prose">
        <dl className="record-details">
          <dt>Decision maker</dt>
          <dd>{d.decisionMaker}</dd>
          <dt>Date</dt>
          <dd>{d.date}</dd>
          <dt>Last updated</dt>
          <dd>{d.lastUpdated ?? d.date}</dd>
          <dt>Related RFC</dt>
          <dd>
            {d.relatedRfc && getRfc(d.relatedRfc) ? (
              <Link href={getRfc(d.relatedRfc)!.canonicalUrl}>RFC {d.relatedRfc}</Link>
            ) : (
              "Not recorded"
            )}
          </dd>
          <dt>Supersedes</dt>
          <dd>{d.supersedes ?? "Not recorded"}</dd>
          <dt>Superseded by</dt>
          <dd>{d.supersededBy ?? "Not recorded"}</dd>
        </dl>
        <p>{d.content}</p>
      </article>
    </main>
  );
}
