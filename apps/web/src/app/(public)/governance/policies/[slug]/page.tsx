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
        <p>
          <strong>Effective:</strong> {p.effectiveDate}
        </p>
        <p>{p.content}</p>
      </article>
    </main>
  );
}
