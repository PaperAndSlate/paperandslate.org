import Link from "next/link";
import Image from "next/image";
import type { NewsArticle } from "../../../../packages/content/src/models";

export function NewsFilteredList({ items, label }: { items: NewsArticle[]; label: string }) {
  return items.length > 0 ? (
    <div className="card-grid">
      {items.map((item) => (
        <article className="info-card news-list-card" key={item.id}>
          {item.image ? (
            <div className="news-list-media">
              <Image
                src={item.image}
                alt={item.imageAlt ?? ""}
                fill
                sizes="(max-width: 639px) 100vw, 33vw"
              />
            </div>
          ) : null}
          <p className="record-meta">
            {item.date} · {item.type} · {item.tags.join(", ")}
          </p>
          <h2>{item.title}</h2>
          <p>{item.summary}</p>
          <Link href={item.canonicalUrl}>Read update →</Link>
        </article>
      ))}
    </div>
  ) : (
    <p className="empty-state">No published news currently matches {label}.</p>
  );
}
