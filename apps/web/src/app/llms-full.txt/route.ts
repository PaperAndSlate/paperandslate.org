import { docText, docsForAi } from "../../lib/docs";
export const dynamic = "force-static";
export function GET() {
  return new Response(docsForAi().map(docText).join("\n\n---\n\n"), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
