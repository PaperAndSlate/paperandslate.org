import { PageHeader } from "../../../../components/page-primitives";
import { StandardsMethodology } from "../../../../components/standards/standards-methodology";

export const metadata = {
  title: "Standards methodology and trust — Paper & Slate",
  description:
    "How Paper & Slate Standards handles authority, provenance, release status, rights, changes, and corrections.",
};

export default function StandardsMethodologyPage() {
  return (
    <main id="main-content" className="page-wrap container standards-methodology-page">
      <PageHeader
        eyebrow="Standards / Methodology and trust"
        title="How Slate & Paper Standards works."
      >
        Our goal is not to rewrite academic standards. It is to make official standards and
        curriculum frameworks easier to find, compare, and use without losing their source,
        structure, history, or rights.
      </PageHeader>
      <StandardsMethodology />
    </main>
  );
}
