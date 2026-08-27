import { NextResponse } from "next/server";
import { searchStatus } from "../../lib/search";
export function GET() {
  return NextResponse.json(
    {
      status: "ok",
      deployment: process.env.VERCEL_ENV || "local",
      build: process.env.NEXT_BUILD_ID || "local",
      docs: { sourceCount: 2, lockHash: "local-content-lock" },
      search: { mode: searchStatus.mode, configured: searchStatus.configured, ready: true },
    },
    { headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } },
  );
}
