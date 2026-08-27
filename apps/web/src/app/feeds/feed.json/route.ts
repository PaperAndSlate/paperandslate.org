import { jsonFeed } from "../../../lib/feeds";
export function GET() {
  return Response.json(jsonFeed(), { headers: { "cache-control": "public, max-age=300" } });
}
