import Link from "next/link";
import type { DocsDocument } from "../../../../packages/docs-ingestion/src/types";
import { PageHeader } from "./page-primitives";

export function DocsTaxonomyPage({
  documents,
  taxonomy,
  title,
}: {
  documents: DocsDocument[];
  taxonomy: string;
  title: string;
}) {
  const visible = documents.filter((document) => document.taxonomy.includes(taxonomy));

  return (
    <main id="main-content" className="prose">
      <PageHeader eyebrow="Documentation" title={title}>
        Browse reviewed local documents filed under this documentation topic.
      </PageHeader>
      {visible.length > 0 ? (
        <div className="card-grid">
          {visible.map((document) => (
            <article className="info-card" key={document.id}>
              <p className="eyebrow">
                {document.status} · {document.version}
              </p>
              <h2>
                <Link href={document.canonicalRoute}>{document.title}</Link>
              </h2>
              <p>{document.description}</p>
              <p className="muted">
                Source: {document.sourceId} · {document.ref}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <p className="empty-state">
          No ingested documents are currently filed under {taxonomy}. This landing page is ready for
          a reviewed local document.
        </p>
      )}
    </main>
  );
}
