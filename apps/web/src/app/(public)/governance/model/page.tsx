import { PageHeader } from "../../../../components/page-primitives";
export default function Model() {
  return (
    <main id="main-content" className="page-wrap container">
      <PageHeader eyebrow="Governance" title="Governance model">
        The local maintainer process proposes, reviews, records, and revisits changes. Published
        RFCs and decisions are the durable record for this milestone.
      </PageHeader>
    </main>
  );
}
