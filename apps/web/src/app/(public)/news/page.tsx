import { PageHeader } from "../../../components/page-primitives";
import Link from "next/link";
import { NewsletterForm } from "../../../components/newsletter-form";
import { newsCategories, publishedNews } from "@paper-and-slate/content";
import { NewsFilteredList } from "../../../components/news-filtered-list";
import { kitConfigured } from "../../../lib/newsletter";
export default async function News({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; tag?: string }>;
}) {
  const filters = await searchParams;
  const items = publishedNews.filter(
    (item) =>
      (!filters.category || item.type === filters.category) &&
      (!filters.tag || item.tags.includes(filters.tag)),
  );
  return (
    <main id="main-content" className="page-wrap container">
      <PageHeader eyebrow="News" title="Updates from the work.">
        Reviewed, dated updates from the local public record. Draft and future items are not
        published.
      </PageHeader>
      <nav aria-label="News feeds">
        <Link href="/feeds/rss.xml">RSS</Link> · <Link href="/feeds/atom.xml">Atom</Link> ·{" "}
        <Link href="/feeds/feed.json">JSON Feed</Link>
      </nav>
      <form className="search-box" method="get" aria-label="Filter news">
        <label>
          Category{" "}
          <select name="category" defaultValue={filters.category ?? ""}>
            <option value="">All</option>
            {newsCategories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </label>
        <input name="tag" placeholder="Tag" defaultValue={filters.tag ?? ""} />
        <button className="button button-dark">Filter</button>
      </form>
      <NewsFilteredList items={items} label="the selected filters" />
      <section className="section">
        <h2>Stay close to the work</h2>
        <p>Subscribe only when the local newsletter integration is explicitly enabled.</p>
        <NewsletterForm enabled={kitConfigured()} />
      </section>
    </main>
  );
}
