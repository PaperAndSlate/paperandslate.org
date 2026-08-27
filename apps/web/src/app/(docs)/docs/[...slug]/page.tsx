import Link from "next/link";
import { notFound } from "next/navigation";
import { DocsRenderer } from "../../../../components/docs-renderer";
import { DocsInteractive } from "../../../../components/docs-interactive";
import { SourceProvenance } from "../../../../components/source-provenance";
import { VersionSelector } from "../../../../components/version-selector";
import { DocsTableOfContents } from "../../../../components/docs-table-of-contents";
import { DocsPageActions } from "../../../../components/docs-page-actions";
import { docs, getDoc } from "../../../../lib/docs";
export const dynamic = "force-static";
export function generateStaticParams() {
  return [...new Set(docs.flatMap((doc) => [doc.canonicalRoute, doc.route, ...doc.aliases]))].map(
    (route) => ({ slug: route.split("/").filter(Boolean).slice(1) }),
  );
}
export default async function DocPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const doc = getDoc(`/docs/${slug.join("/")}`);
  if (!doc) notFound();
  const rawRoute = `/docs/raw/${slug.join("/")}`;
  const versioned = docs
    .filter((candidate) => candidate.project === doc.project && candidate.version === doc.version)
    .sort((a, b) => a.route.localeCompare(b.route));
  const index = versioned.findIndex((candidate) => candidate.id === doc.id);
  const previous = index > 0 ? versioned[index - 1] : undefined;
  const next = index >= 0 ? versioned[index + 1] : undefined;

  return (
    <main id="main-content" className="page-wrap docs-article">
      <nav className="docs-breadcrumbs" aria-label="Breadcrumb">
        <Link href="/docs">Documentation</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/docs/${doc.project}`}>{doc.project}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{doc.title}</span>
      </nav>
      <div className="eyebrow">
        {doc.status} · version {doc.version} · {doc.taxonomy.join(" / ")}
      </div>
      <h1>{doc.title}</h1>
      {doc.description ? <p className="lede">{doc.description}</p> : null}
      <DocsPageActions rawRoute={rawRoute} />
      <p className="muted">
        <Link rel="canonical" href={doc.canonicalRoute}>
          Canonical URL
        </Link>{" "}
        · <a href={rawRoute}>Raw Markdown</a> · Source: {doc.sourceId} at {doc.ref}
      </p>
      <VersionSelector doc={doc} documents={docs} />
      <details className="docs-metadata">
        <summary>Source and requirement metadata</summary>
        <SourceProvenance doc={doc} />
        <DocsInteractive title="Requirement anchors">
          <ul>
            {doc.requirementAnchors.map((anchor) => (
              <li key={anchor}>
                <a href={`#${anchor}`}>{anchor}</a>
              </li>
            ))}
          </ul>
        </DocsInteractive>
      </details>
      <div className="docs-layout">
        <DocsRenderer doc={doc} />
        <DocsTableOfContents headings={doc.headings} />
      </div>
      {(previous || next) && (
        <nav className="docs-nav-footer" aria-label="Documentation pagination">
          {previous ? (
            <Link href={previous.route}>
              <small>Previous</small>
              <span>{previous.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={next.route}>
              <small>Next</small>
              <span>{next.title}</span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </main>
  );
}
