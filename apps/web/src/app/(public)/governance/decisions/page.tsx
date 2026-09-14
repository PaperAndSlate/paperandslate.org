import Link from "next/link";
import { decisions, getRfc } from "@paper-and-slate/content";
import { PageHeader } from "../../../../components/page-primitives";
export default function Decisions() {
  return (
    <main id="main-content" className="page-wrap container">
      <PageHeader eyebrow="Governance" title="Decision records">
        Accepted decisions and their responsible role.
      </PageHeader>
      <div className="card-grid">
        {decisions.map((d) => (
          <article className="info-card" key={d.id}>
            <p className="record-meta">
              {d.id} · {d.date} · {d.status}
            </p>
            <h2>{d.title}</h2>
            <p>{d.summary}</p>
            <p className="record-meta">
              Related RFC:{" "}
              {d.relatedRfc ? (getRfc(d.relatedRfc)?.number ?? "Not found") : "Not recorded"}
              {d.supersedes ? ` · Supersedes ${d.supersedes}` : ""}
            </p>
            <Link href={d.canonicalUrl}>Read decision →</Link>
          </article>
        ))}
      </div>
    </main>
  );
}
