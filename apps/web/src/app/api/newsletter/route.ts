import { NextResponse } from "next/server";
import {
  allowedOrigin,
  clientAddress,
  kitConfigured,
  NewsletterBodyError,
  readNewsletterBody,
  submitNewsletter,
  validateNewsletter,
  withinDistributedAbuseLimit,
} from "../../../lib/newsletter";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const failure = (error: string, status: number) =>
    NextResponse.json(
      { ok: false, error },
      { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } },
    );
  if (!allowedOrigin(request)) return failure("Invalid request", 403);
  const abuseKey = clientAddress(request);
  const abuse = await withinDistributedAbuseLimit(abuseKey);
  if (!abuse.allowed)
    return failure(
      abuse.mode === "valkey-unavailable" || abuse.mode === "distributed-required"
        ? "Signup is temporarily unavailable"
        : "Too many attempts",
      abuse.mode === "valkey-unavailable" || abuse.mode === "distributed-required" ? 503 : 429,
    );
  let input: Record<string, unknown>;
  try {
    input = await readNewsletterBody(request);
  } catch (error) {
    if (error instanceof NewsletterBodyError) return failure(error.message, error.status);
    return failure("Invalid request", 400);
  }
  const result = validateNewsletter(input);
  if (!result.ok || !result.email)
    return failure(result.reason === "consent" ? "Consent is required" : "Invalid request", 400);
  const outcome = await submitNewsletter(result.email, { idempotencyKey: result.idempotencyKey });
  if (outcome.status === "unconfigured") return failure(outcome.message, 503);
  if (outcome.status === "failed")
    return NextResponse.json(
      { ok: false, configured: kitConfigured(), error: outcome.message },
      {
        status: 502,
        headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
      },
    );
  return NextResponse.json(
    { ok: true, configured: true, ...outcome, rateLimit: abuse.mode },
    { headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } },
  );
}
