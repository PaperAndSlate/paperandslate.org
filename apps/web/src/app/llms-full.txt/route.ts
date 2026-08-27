import { docText, docs } from "../../lib/docs";
export const dynamic = "force-static";
export function GET() {
  return new Response(docs.map(docText).join("\n\n---\n\n"), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
