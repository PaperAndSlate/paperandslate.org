import { atom, feedItems, jsonFeed, rss } from "../apps/web/src/lib/feeds";
import { newsCategories, publishedNews } from "../packages/content/src";

const today = new Date().toISOString().slice(0, 10);
if (
  !publishedNews.every(
    (item) =>
      item.status === "published" &&
      item.id &&
      item.canonicalUrl.startsWith("/") &&
      item.summary &&
      item.content &&
      item.date <= today &&
      item.author,
  )
)
  throw new Error("Published feed records must be reviewed, complete, and not future-dated");
if (new Set(publishedNews.map((item) => item.id)).size !== publishedNews.length)
  throw new Error("Feed IDs must be unique");
if (newsCategories.length < 1 || feedItems().length !== publishedNews.length)
  throw new Error("Feed categories or publication filtering are invalid");

const rssDocument = rss();
const atomDocument = atom();
if (
  !rssDocument.startsWith("<?xml") ||
  !/<rss[^>]*>.*<channel>.*<\/channel>.*<\/rss>/s.test(rssDocument)
)
  throw new Error("RSS output is not structurally valid");
if (!atomDocument.startsWith("<?xml") || !/<feed[^>]*>.*<\/feed>/s.test(atomDocument))
  throw new Error("Atom output is not structurally valid");
if ((rssDocument.match(/<item>/g) ?? []).length !== publishedNews.length)
  throw new Error("RSS item count does not match published records");
if ((atomDocument.match(/<entry>/g) ?? []).length !== publishedNews.length)
  throw new Error("Atom entry count does not match published records");

const json = jsonFeed();
if (
  json.version !== "https://jsonfeed.org/version/1.1" ||
  json.items.length !== publishedNews.length ||
  json.items.some(
    (item) => !item.url.startsWith("http") || !item.date_published.endsWith("T00:00:00Z"),
  )
)
  throw new Error("JSON Feed output is invalid");

console.log(`Validated ${publishedNews.length} reviewed records across RSS, Atom, and JSON Feed.`);
