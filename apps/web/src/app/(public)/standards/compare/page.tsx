import { PageHeader } from "../../../../components/page-primitives";
import { StandardsCompare } from "../../../../components/standards/standards-compare";
import { defaultStandardsRelease, getStandardsComparison } from "../../../../lib/standards-api";

export const metadata = {
  title: "Compare standards — Paper & Slate",
  description: "Compare exact candidate Standards releases through their structural metadata.",
};

export default async function StandardsComparePage({
  searchParams,
}: {
  searchParams: Promise<{ left_release?: string; right_release?: string }>;
}) {
  const values = await searchParams;
  const left = values.left_release?.trim() || defaultStandardsRelease;
  const right = values.right_release?.trim() || defaultStandardsRelease;
  const result = await getStandardsComparison(left, right);
  return (
    <main id="main-content" className="page-wrap container standards-compare-page">
      <PageHeader eyebrow="Standards / Compare" title="Compare structure, keep the limits visible.">
        Select exact candidate releases to review their native framework shape. This is a
        source-backed structural projection, not an equivalence or publication claim.
      </PageHeader>
      <StandardsCompare result={result} />
    </main>
  );
}
