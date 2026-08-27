import { PageHeader } from "../../../../components/page-primitives";
import { roadmap } from "@paper-and-slate/content";
export default function Roadmap() {
  return (
    <main id="main-content" className="page-wrap container">
      <PageHeader eyebrow="Foundation / Roadmap" title="A direction, not a promise.">
        Roadmap items use broad horizons because dates and delivery commitments are not yet
        established.
      </PageHeader>
      <div className="card-grid">
        {roadmap.map(({ horizon, title, summary }) => (
          <article className="info-card" key={title}>
            <p className="eyebrow">{horizon}</p>
            <h2>{title}</h2>
            <p>{summary}</p>
            <p className="muted">Status: planned · Last update: initial local milestone</p>
          </article>
        ))}
      </div>
    </main>
  );
}
