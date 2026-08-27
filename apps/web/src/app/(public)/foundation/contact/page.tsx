import { PageHeader } from "../../../../components/page-primitives";
export default function Contact() {
  return (
    <main id="main-content" className="page-wrap container">
      <PageHeader eyebrow="Foundation / Contact" title="Bring a question to the right place.">
        Contact infrastructure is not active in this local milestone, so no personal addresses are
        published.
      </PageHeader>
      <div className="card-grid">
        <article className="info-card">
          <h2>General questions</h2>
          <p>Role-based contact channels are planned.</p>
        </article>
        <article className="info-card">
          <h2>Technical and security</h2>
          <p>
            Future project discussions and security reporting paths will be published before launch.
          </p>
        </article>
        <article className="info-card">
          <h2>Governance and media</h2>
          <p>
            Governance concerns, trademark questions, and media inquiries will use role aliases when
            available.
          </p>
        </article>
      </div>
    </main>
  );
}
