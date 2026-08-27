import { notFound } from "next/navigation";
import { decisions, getDecision } from "@paper-and-slate/content";
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
        <p>
          <strong>Decision maker:</strong> {d.decisionMaker}
        </p>
        <p>{d.content}</p>
      </article>
    </main>
  );
}
