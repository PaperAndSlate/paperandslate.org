import { PageHeader } from "../../../../components/page-primitives";
import { StandardsCoverage } from "../../../../components/standards/standards-coverage";
import { getStandardsCoverage } from "../../../../lib/standards-api";

export const metadata = {
  title: "Standards coverage — Paper & Slate",
  description:
    "See the jurisdictions, frameworks, structure, provenance, and rights states recorded in the pinned Standards release.",
};

export default async function StandardsCoveragePage() {
  const result = await getStandardsCoverage();
  return (
    <main id="main-content" className="page-wrap container standards-coverage-page">
      <PageHeader eyebrow="Standards / Coverage" title="See what the release actually covers.">
        A precise, release-pinned view of framework and jurisdiction metadata. Coverage here means
        records and structure in the synchronized projection—not a quality, equivalence, or support
        claim.
      </PageHeader>
      <StandardsCoverage result={result} />
    </main>
  );
}
