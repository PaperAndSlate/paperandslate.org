import { atom } from "../../../lib/feeds";
export function GET() {
  return new Response(atom(), {
    headers: {
      "content-type": "application/atom+xml; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
}
