import { NextResponse } from "next/server";
import { searchStatus } from "../../lib/search";
export function GET() {
  return NextResponse.json(
    {
      status: "ok",
      deployment:
        process.env.DEPLOYMENT_ENV ||
        process.env.PAPER_SLATE_ENV ||
        process.env.VERCEL_ENV ||
        "local",
      releaseId: process.env.RELEASE_ID || "local-development",
      gitSha: process.env.GIT_SHA || "local-development",
      build: process.env.NEXT_BUILD_ID || process.env.RELEASE_ID || "local",
      docs: { sourceCount: 8, lockHash: process.env.DOCS_LOCK_HASH || "local-content-lock" },
      search: { mode: searchStatus.mode, configured: searchStatus.configured, ready: true },
    },
    { headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } },
  );
}
