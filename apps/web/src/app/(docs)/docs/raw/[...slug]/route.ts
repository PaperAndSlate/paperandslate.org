import { notFound } from "next/navigation";
import { docText, getDoc } from "../../../../../lib/docs";

export const dynamic = "force-static";

export function GET(_request: Request, context: { params: Promise<{ slug: string[] }> }) {
  return context.params.then(({ slug }) => {
    const doc = getDoc(`/docs/${slug.join("/")}`);
    if (!doc) return notFound();

    return new Response(docText(doc), {
      headers: {
        "content-type": "text/markdown; charset=utf-8",
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  });
}
