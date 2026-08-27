import Link from "next/link";
import { foundationPages } from "@paper-and-slate/content";
import { PageHeader, InfoCard } from "../../../components/page-primitives";
export default function FoundationPage() {
  return (
    <main id="main-content" className="page-wrap container">
      <PageHeader eyebrow="Foundation" title="Infrastructure for education that can be shared.">
        Paper & Slate is a planned open foundation for standards, formats, schemas, and tools that
        help education systems connect.
      </PageHeader>
      <div className="card-grid">
        {foundationPages.map((page) => (
          <InfoCard key={page.slug} title={page.title}>
            <p>{page.summary}</p>
            <p className="muted">Status: {page.status}</p>
            <Link href={`/foundation/${page.slug}`}>Read more →</Link>
          </InfoCard>
        ))}
      </div>
    </main>
  );
}
