import Link from "next/link";
import { policies } from "@paper-and-slate/content";
import { PageHeader } from "../../../../components/page-primitives";
export default function Policies() {
  return (
    <main id="main-content" className="page-wrap container">
      <PageHeader eyebrow="Governance" title="Policies and licenses">
        Current project metadata and notices.
      </PageHeader>
      <div className="card-grid">
        {policies
          .filter((p) => p.status === "current")
          .map((p) => (
            <article className="info-card" key={p.slug}>
              <p className="record-meta">
                {p.kind} · v{p.version} · effective {p.effectiveDate}
              </p>
              <h2>{p.title}</h2>
              <p>{p.summary}</p>
              <p className="record-meta">
                Owner: {p.owner} · Last reviewed: {p.lastReviewed ?? "Not recorded"} · Next review:{" "}
                {p.nextReview ?? "Not recorded"}
              </p>
              <Link href={p.canonicalUrl}>Read notice →</Link>
            </article>
          ))}
      </div>
    </main>
  );
}
