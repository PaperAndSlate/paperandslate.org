import { PageHeader } from "../../../../components/page-primitives";
const principles = [
  ["Open by default", "Public artifacts should be inspectable and reusable where possible."],
  ["Vendor neutral", "Infrastructure should not require one product or provider."],
  ["Interoperable", "Shared formats should make connections clearer across systems."],
  ["Education first", "Technical choices should serve real education work."],
];
export default function Principles() {
  return (
    <main id="main-content" className="page-wrap container">
      <PageHeader eyebrow="Foundation / Principles" title="A few durable commitments.">
        These principles are the current planned guide for Paper & Slate work.
      </PageHeader>
      <div className="card-grid">
        {principles.map(([title, body]) => (
          <article className="info-card" key={title}>
            <h2>{title}</h2>
            <p>{body}</p>
            <p className="muted">
              Implication: decisions should make this commitment visible and testable.
            </p>
          </article>
        ))}
      </div>
    </main>
  );
}
