import { notFound } from "next/navigation";
import { getRfc, rfcs } from "@paper-and-slate/content";
import { PageHeader } from "../../../../../components/page-primitives";
export function generateStaticParams() {
  return rfcs.map((r) => ({ number: String(r.number) }));
}
export default async function Rfc({ params }: { params: Promise<{ number: string }> }) {
  const r = getRfc(Number((await params).number));
  if (!r) notFound();
  return (
    <main id="main-content" className="page-wrap container">
      <PageHeader eyebrow={`RFC ${r.number} · ${r.status}`} title={r.title}>
        {r.summary}
      </PageHeader>
      <article className="prose">
        <p>
          <strong>Owner:</strong> {r.owner}
        </p>
        <p>{r.content}</p>
      </article>
    </main>
  );
}
