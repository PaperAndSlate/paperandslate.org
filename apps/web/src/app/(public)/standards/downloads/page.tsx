import { PageHeader } from "../../../../components/page-primitives";
import { StandardsDownloads } from "../../../../components/standards/standards-downloads";
import { getStandardsApiReadiness } from "../../../../lib/standards-api";

export const metadata = {
  title: "Standards downloads — Paper & Slate",
  description: "Release-bound Standards download readiness and rights state.",
};

export default async function StandardsDownloadsPage() {
  const result = await getStandardsApiReadiness();
  return (
    <main id="main-content" className="page-wrap container standards-downloads-page">
      <PageHeader
        eyebrow="Standards / downloads"
        title="Download readiness, with the limits visible."
      >
        Review the selected candidate release, provenance, publication state, and export boundary
        before any downloadable artifact can be considered.
      </PageHeader>
      <StandardsDownloads result={result} />
    </main>
  );
}
