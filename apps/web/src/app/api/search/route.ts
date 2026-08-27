import { NextRequest, NextResponse } from "next/server";
import { searchLocal } from "../../../lib/search";

const types = new Set([
  "project",
  "documentation",
  "governance",
  "rfc",
  "decision",
  "policy",
  "news",
  "report",
]);
const sources = new Set(["content", "docs", "governance", "news"]);

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const query = (params.get("q") ?? "").slice(0, 120);
  const requestedLimit = Number.parseInt(params.get("limit") ?? "20", 10);
  const limit = Number.isFinite(requestedLimit) ? Math.max(1, Math.min(requestedLimit, 20)) : 20;
  const type = params.get("type") ?? undefined;
  const source = params.get("source") ?? undefined;
  if ((type && !types.has(type)) || (source && !sources.has(source)))
    return NextResponse.json({ error: "Invalid search filter" }, { status: 400 });
  try {
    const response = await searchLocal(query, {
      limit,
      filters: { type: type as never, source: source as never },
    });
    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "private, max-age=30",
        "X-Content-Type-Options": "nosniff",
        Vary: "Accept",
      },
    });
  } catch (error) {
    const status = error instanceof DOMException && error.name === "AbortError" ? 499 : 503;
    return NextResponse.json(
      { error: status === 499 ? "Search cancelled" : "Search is temporarily unavailable" },
      { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } },
    );
  }
}
