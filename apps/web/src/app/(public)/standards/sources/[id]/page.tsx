import type { Metadata } from "next";
import { PageHeader } from "../../../../../components/page-primitives";
import { StandardsSourceDetail } from "../../../../../components/standards/standards-source-detail";
import { getStandardsSourceDetail } from "../../../../../lib/standards-api";

export const metadata: Metadata = {
  title: "Standards source detail — Paper & Slate",
  description: "Source identity, rights, provenance, and release metadata for Standards.",
};

export default async function StandardsSourcePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ release?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const detail = await getStandardsSourceDetail(id, query.release);
  return (
    <main id="main-content" className="page-wrap container standards-explore">
      <PageHeader eyebrow="Standards / Sources" title="Source detail.">
        Inspect the exact release-bound source projection, provenance, rights, and publication
        limits.
      </PageHeader>
      <StandardsSourceDetail detail={detail} />
    </main>
  );
}
