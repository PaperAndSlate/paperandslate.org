import { NextResponse } from "next/server";
import {
  allowedOrigin,
  kitConfigured,
  submitNewsletter,
  validateNewsletter,
  withinDistributedAbuseLimit,
} from "../../../lib/newsletter";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (request.body === null || !allowedOrigin(request))
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 8192)
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 413 });
  const abuseKey = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
  const abuse = await withinDistributedAbuseLimit(abuseKey);
  if (!abuse.allowed)
    return NextResponse.json({ ok: false, error: "Too many attempts" }, { status: 429 });
  const type = request.headers.get("content-type") || "";
  let input: Record<string, unknown>;
  try {
    input = type.includes("application/json")
      ? await request.json()
      : Object.fromEntries((await request.formData()).entries());
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
  const result = validateNewsletter(input);
  if (!result.ok || !result.email)
    return NextResponse.json(
      { ok: false, error: result.reason === "consent" ? "Consent is required" : "Invalid request" },
      { status: 400 },
    );
  const outcome = await submitNewsletter(result.email, { idempotencyKey: result.idempotencyKey });
  if (outcome.status === "unconfigured")
    return NextResponse.json(
      { ok: false, configured: false, error: outcome.message },
      { status: 503 },
    );
  if (outcome.status === "failed")
    return NextResponse.json(
      { ok: false, configured: kitConfigured(), error: outcome.message },
      { status: 502 },
    );
  return NextResponse.json(
    { ok: true, configured: true, ...outcome, rateLimit: abuse.mode },
    { headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } },
  );
}
