import Link from "next/link";
import { rfcs } from "@paper-and-slate/content";
import { PageHeader } from "../../../../components/page-primitives";
export default function Rfcs() {
  return (
    <main id="main-content" className="page-wrap container">
      <PageHeader eyebrow="Governance" title="Requests for comment">
        RFCs record proposals and their lifecycle.
      </PageHeader>
      <div className="card-grid">
        {rfcs.map((r) => (
          <article className="info-card" key={r.number}>
            <p className="record-meta">
              RFC {r.number} · {r.status}
            </p>
            <h2>{r.title}</h2>
            <p>{r.summary}</p>
            <Link href={r.canonicalUrl}>Read RFC →</Link>
          </article>
        ))}
      </div>
    </main>
  );
}
