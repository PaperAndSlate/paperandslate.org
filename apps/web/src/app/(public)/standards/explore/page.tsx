import { PageHeader } from "../../../../components/page-primitives";
import { StandardsExplorer } from "../../../../components/standards/standards-explorer";
import { searchStandards, type StandardsQuery } from "../../../../lib/standards-api";

export const metadata = {
  title: "Explore standards — Paper & Slate",
  description: "Search source-backed educational standards and curriculum framework metadata.",
};

export default async function StandardsExplore({
  searchParams,
}: {
  searchParams: Promise<StandardsQuery>;
}) {
  const values = await searchParams;
  const result = await searchStandards(values);
  return (
    <main id="main-content" className="page-wrap container standards-explore">
      <PageHeader eyebrow="Standards / Explore" title="Search the standards catalog.">
        Browse a release-pinned preview of source-backed framework metadata. Candidate records are
        labeled clearly and rights-limited records never include restricted wording.
      </PageHeader>
      <StandardsExplorer values={values} result={result} />
    </main>
  );
}
