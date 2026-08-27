import { PageHeader } from "../../../../components/page-primitives";
import { StandardsSources } from "../../../../components/standards/standards-sources";
import { getStandardsSources } from "../../../../lib/standards-api";

export const metadata = {
  title: "Standards sources — Paper & Slate",
  description:
    "Browse the authority, provenance, rights, and release metadata behind the Standards catalog.",
};

export default async function StandardsSourcesPage() {
  const result = await getStandardsSources();
  return (
    <main id="main-content" className="page-wrap container standards-sources-page">
      <PageHeader eyebrow="Standards / Sources" title="Know where the standards come from.">
        Browse source authority, official links, provenance, rights summaries, and snapshot metadata
        for the pinned Standards release. This directory displays metadata only.
      </PageHeader>
      <StandardsSources result={result} />
    </main>
  );
}
