import { PageHeader } from "../../../../../components/page-primitives";
import { publishedNews, newsCategories } from "@paper-and-slate/content";
import { NewsFilteredList } from "../../../../../components/news-filtered-list";

export function generateStaticParams() {
  return newsCategories.map((category) => ({ category }));
}
export default async function NewsCategory({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const items = publishedNews.filter((item) => item.type === category);
  return (
    <main id="main-content" className="page-wrap container">
      <PageHeader eyebrow="News category" title={category}>
        Published updates filed under this category.
      </PageHeader>
      <NewsFilteredList items={items} label={`the category “${category}”`} />
    </main>
  );
}
