import type { Metadata } from "next";
import { PageHeader } from "../../../../components/page-primitives";
import { StandardsChanges } from "../../../../components/standards/standards-changes";
import { getStandardsChanges } from "../../../../lib/standards-api";

export const metadata: Metadata = {
  title: "Standards changes — Paper & Slate",
  description: "Candidate-only metadata history for standards releases.",
};
export default async function StandardsChangesPage() {
  const result = await getStandardsChanges();
  return (
    <main id="main-content" className="page-wrap container standards-explore">
      <PageHeader eyebrow="Standards / Changes" title="Change history.">
        Review release-pinned candidate metadata without exposing restricted wording or bytes.
      </PageHeader>
      <StandardsChanges result={result} />
    </main>
  );
}
