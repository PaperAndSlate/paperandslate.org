import { PageHeader } from "../../../../components/page-primitives";
export default function Funding() {
  return (
    <main id="main-content" className="page-wrap container">
      <PageHeader eyebrow="Foundation / Funding" title="Funding and independence">
        This local milestone has no funding program, sponsors, paid staff, or donation flow to
        disclose.
      </PageHeader>
      <article className="prose">
        <p>
          Future funding disclosures will identify sources, infrastructure support, compensation,
          conflicts, and expenses. Normative standards are intended to remain freely accessible.
        </p>
        <h2>Current legal status</h2>
        <p>
          No public legal or nonprofit status is claimed here. Any future status will be published
          only when verified.
        </p>
        <h2>Sponsorship policy</h2>
        <p>A sponsorship and conflict policy is planned before sponsorship is accepted.</p>
      </article>
    </main>
  );
}
