import { docs } from "../../lib/docs";
export const dynamic = "force-static";
export function GET() {
  const body = docs
    .map((doc) => `- [${doc.title}](${doc.route}): ${doc.description ?? ""}`)
    .join("\n");
  return new Response(`# Paper & Slate documentation\n\n${body}\n`, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
