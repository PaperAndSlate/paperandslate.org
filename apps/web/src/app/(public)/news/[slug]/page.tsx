import { notFound } from "next/navigation";
import { getNews } from "@paper-and-slate/content";
import { PageHeader } from "../../../../components/page-primitives";
export function generateStaticParams() {
  return [{ slug: "local-publishing-foundations" }];
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const item = getNews((await params).slug);
  return item
    ? {
        title: item.title,
        description: item.summary,
        alternates: { canonical: item.canonicalUrl },
        openGraph: {
          type: "article",
          url: item.canonicalUrl,
          title: item.title,
          description: item.summary,
        },
      }
    : {};
}
export default async function NewsArticle({ params }: { params: Promise<{ slug: string }> }) {
  const item = getNews((await params).slug);
  if (!item) notFound();
  return (
    <main id="main-content" className="page-wrap container">
      <PageHeader eyebrow={`${item.type} · ${item.date}`} title={item.title}>
        {item.summary}
      </PageHeader>
      <article className="prose">
        <p>
          <strong>Author:</strong> {item.author}
        </p>
        <p>{item.content}</p>
        {item.related.length > 0 && (
          <p className="muted">Related records: {item.related.join(", ")}</p>
        )}
      </article>
    </main>
  );
}
