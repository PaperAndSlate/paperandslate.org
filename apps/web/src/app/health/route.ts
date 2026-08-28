import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import docsLock from "../../../../../.generated/docs/docs-sources.lock.json";
import { getSearchHealth } from "../../lib/search";

const docsLockText = JSON.stringify(docsLock);
const docsLockHash = createHash("sha256").update(docsLockText).digest("hex");
const docsSourceCount = new Set(
  ((docsLock as { sources?: Array<{ sourceId?: string }> }).sources ?? [])
    .map((source) => source.sourceId)
    .filter((sourceId): sourceId is string => Boolean(sourceId)),
).size;

export async function GET() {
  const search = await getSearchHealth();
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
      docs: {
        sourceCount: docsSourceCount,
        lockHash: process.env.DOCS_LOCK_HASH || docsLockHash,
      },
      search,
    },
    { headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } },
  );
}
