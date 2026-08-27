import { publishedNews } from "@paper-and-slate/content";
const site = () => process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
export function feedItems(category?: string, tag?: string) {
  return publishedNews
    .filter((item) => (!category || item.type === category) && (!tag || item.tags.includes(tag)))
    .map((item) => ({ ...item, url: `${site()}${item.canonicalUrl}` }));
}
export function rss() {
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Paper &amp; Slate News</title><link>${site()}/news</link><description>Reviewed Paper &amp; Slate updates.</description>${feedItems()
    .map(
      (i) =>
        `<item><guid isPermaLink="false">${i.id}</guid><title>${escapeXml(i.title)}</title><link>${i.url}</link><pubDate>${new Date(`${i.date}T00:00:00Z`).toUTCString()}</pubDate><description>${escapeXml(i.summary)}</description></item>`,
    )
    .join("")}</channel></rss>`;
}
export function atom() {
  return `<?xml version="1.0" encoding="UTF-8"?><feed xmlns="http://www.w3.org/2005/Atom"><title>Paper &amp; Slate News</title><id>${site()}/news</id><updated>${feedItems()[0]?.date ?? "2026-08-18"}T00:00:00Z</updated>${feedItems()
    .map(
      (i) =>
        `<entry><id>${i.id}</id><title>${escapeXml(i.title)}</title><link href="${i.url}"/><updated>${i.date}T00:00:00Z</updated><summary>${escapeXml(i.summary)}</summary></entry>`,
    )
    .join("")}</feed>`;
}
export function jsonFeed() {
  return {
    version: "https://jsonfeed.org/version/1.1",
    title: "Paper & Slate News",
    home_page_url: `${site()}/news`,
    feed_url: `${site()}/feeds/feed.json`,
    items: feedItems().map((i) => ({
      id: i.id,
      url: i.url,
      title: i.title,
      content_text: i.content,
      date_published: `${i.date}T00:00:00Z`,
      summary: i.summary,
    })),
  };
}
function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
