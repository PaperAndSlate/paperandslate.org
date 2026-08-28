import { PageHeader } from "../../../../components/page-primitives";
import { StandardsConcepts } from "../../../../components/standards/standards-concepts";
import { getStandardsConceptsCrosswalks } from "../../../../lib/standards-api";

export const metadata = {
  title: "Standards concepts and crosswalks — Paper & Slate",
  description:
    "Review the release-pinned readiness and limits for Standards concepts and crosswalks.",
};

export default async function StandardsConceptsPage() {
  const result = await getStandardsConceptsCrosswalks();
  return (
    <main id="main-content" className="page-wrap container standards-concepts-page">
      <PageHeader
        eyebrow="Standards / Concepts and crosswalks"
        title="What has been reviewed across standards?"
      >
        Concepts and crosswalks are shown only when the synchronized projection supplies reviewed
        evidence. This page reports readiness and limitations without inferring relationships.
      </PageHeader>
      <StandardsConcepts result={result} />
    </main>
  );
}
