import { PageHeader } from "../../../../components/page-primitives";
import { StandardsApi } from "../../../../components/standards/standards-api";
import { getStandardsApiReadiness } from "../../../../lib/standards-api";

export const metadata = {
  title: "Standards API — Paper & Slate",
  description: "Release-bound Standards API and developer readiness metadata.",
};

export default async function StandardsApiPage() {
  const result = await getStandardsApiReadiness();
  return (
    <main id="main-content" className="page-wrap container standards-api-page">
      <PageHeader eyebrow="Standards / API" title="Build against the metadata boundary.">
        See the selected candidate release, API quick start, provenance, and CASE compatibility
        without implying a stable public contract.
      </PageHeader>
      <StandardsApi result={result} />
    </main>
  );
}
