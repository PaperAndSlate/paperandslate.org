import type { Metadata } from "next";
import { PageHeader } from "../../../../../components/page-primitives";
import { StandardsItemDetail } from "../../../../../components/standards/standards-item-detail";
import { getStandardsItemDetail } from "../../../../../lib/standards-api";

export const metadata: Metadata = {
  title: "Standards item — Paper & Slate",
  description: "Source-backed educational standards node metadata, hierarchy, and provenance.",
};

export default async function StandardsItemPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ release?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const detail = await getStandardsItemDetail(id, query.release);
  return (
    <main id="main-content" className="page-wrap container standards-explore">
      <PageHeader eyebrow="Standards / Item" title="Standards item detail.">
        Inspect the exact candidate projection, native structure, hierarchy, source provenance, and
        rights limits.
      </PageHeader>
      <StandardsItemDetail detail={detail} />
    </main>
  );
}
