import { rss } from "../../../lib/feeds";
export function GET() {
  return new Response(rss(), {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
}
