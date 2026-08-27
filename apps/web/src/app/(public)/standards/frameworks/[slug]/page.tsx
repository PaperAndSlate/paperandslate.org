import type { Metadata } from "next";
import { PageHeader } from "../../../../../components/page-primitives";
import { StandardsFrameworkDetail } from "../../../../../components/standards/standards-framework-detail";
import { getStandardsFrameworkDetail } from "../../../../../lib/standards-api";

export const metadata: Metadata = {
  title: "Framework detail — Paper & Slate",
  description: "Source-backed educational framework metadata and release provenance.",
};

export default async function StandardsFrameworkPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ release?: string }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const detail = await getStandardsFrameworkDetail(slug, query.release);
  return (
    <main id="main-content" className="page-wrap container standards-explore">
      <PageHeader eyebrow="Standards / Frameworks" title="Framework detail.">
        Inspect the pinned candidate projection, native hierarchy, source record, and rights limits.
      </PageHeader>
      <StandardsFrameworkDetail detail={detail} />
    </main>
  );
}
