import { PageHeader } from "../../../../../components/page-primitives";
import { publishedNews } from "@paper-and-slate/content";
import { NewsFilteredList } from "../../../../../components/news-filtered-list";

export function generateStaticParams() {
  return [...new Set(publishedNews.flatMap((item) => item.tags))].map((tag) => ({ tag }));
}
export default async function NewsTag({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const items = publishedNews.filter((item) => item.tags.includes(tag));
  return (
    <main id="main-content" className="page-wrap container">
      <PageHeader eyebrow="News tag" title={tag}>
        Published updates carrying this tag.
      </PageHeader>
      <NewsFilteredList items={items} label={`the tag “${tag}”`} />
    </main>
  );
}
