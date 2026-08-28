import net from "node:net";
import tls from "node:tls";
import { parseEnv, type Env } from "@paper-and-slate/config";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const NEWSLETTER_BODY_LIMIT_BYTES = 8192;
const IDEMPOTENCY_TTL_SECONDS = 24 * 60 * 60;

export type NewsletterInput = {
  email?: unknown;
  consent?: unknown;
  website?: unknown;
  idempotencyKey?: unknown;
};
export type NewsletterResult =
  | { status: "subscribed" | "duplicate"; message: string }
  | { status: "unconfigured" | "failed"; message: string };

export class NewsletterBodyError extends Error {
  constructor(
    message: string,
    readonly status: 400 | 413 | 415 = 400,
  ) {
    super(message);
  }
}

export function validateNewsletter(input: NewsletterInput) {
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  if (email.length > 254 || !emailPattern.test(email))
    return { ok: false as const, reason: "invalid" as const };
  if (input.consent !== true && input.consent !== "on" && input.consent !== "true")
    return { ok: false as const, reason: "consent" as const };
  if (typeof input.website === "string" && input.website.trim())
    return { ok: false as const, reason: "bot" as const };
  const idempotencyKey =
    typeof input.idempotencyKey === "string" &&
    /^[a-zA-Z0-9._:-]{8,120}$/.test(input.idempotencyKey)
      ? input.idempotencyKey
      : undefined;
  return { ok: true as const, email, idempotencyKey };
}

function requestOrigin(request: Request) {
  try {
    return new URL(request.url).origin;
  } catch {
    return null;
  }
}

/**
 * Browser submissions must carry a same-origin Origin header. A missing Origin
 * is accepted only when Fetch Metadata independently identifies same-origin
 * browser navigation; arbitrary server/API clients therefore fail closed.
 */
export function allowedOrigin(request: Request, env: Env = parseEnv()) {
  const origin = request.headers.get("origin");
  const expected = requestOrigin(request);
  if (!expected) return false;
  if (!origin) return request.headers.get("sec-fetch-site") === "same-origin";
  try {
    const configured = new URL(env.NEXT_PUBLIC_SITE_URL).origin;
    return new URL(origin).origin === expected || new URL(origin).origin === configured;
  } catch {
    return false;
  }
}

function validAddress(value: string | null) {
  if (!value) return null;
  const candidate = value.trim().replace(/^\[|\]$/g, "");
  return net.isIP(candidate) ? candidate : null;
}

/**
 * Coolify is the only supported trusted-proxy mode. In that mode the
 * platform-scrubbed x-real-ip value wins; otherwise the application never
 * uses arbitrary x-forwarded-for input as an identity. Rate limiting remains
 * fail-safe (one anonymous bucket) until the deployment explicitly configures
 * the proxy contract.
 */
export function clientAddress(request: Request, env: Env = parseEnv()) {
  if (env.TRUSTED_PROXY_MODE !== "coolify") return "anonymous";
  return (
    validAddress(request.headers.get("x-real-ip")) ??
    validAddress(request.headers.get("x-forwarded-for")?.split(",", 1)[0] ?? null) ??
    "anonymous"
  );
}

function objectFromEntries(entries: Iterable<[string, FormDataEntryValue | string]>) {
  return Object.fromEntries(entries) as Record<string, unknown>;
}

/** Read and parse a newsletter body after enforcing a byte limit on the stream itself. */
export async function readNewsletterBody(
  request: Request,
  maxBytes = NEWSLETTER_BODY_LIMIT_BYTES,
): Promise<Record<string, unknown>> {
  const declaredLength = request.headers.get("content-length");
  if (declaredLength !== null) {
    const parsedLength = Number(declaredLength);
    if (!Number.isSafeInteger(parsedLength) || parsedLength < 0)
      throw new NewsletterBodyError("Invalid request", 400);
    if (parsedLength > maxBytes) throw new NewsletterBodyError("Request body is too large", 413);
  }
  if (!request.body) throw new NewsletterBodyError("Invalid request", 400);

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      total += next.value.byteLength;
      if (total > maxBytes) throw new NewsletterBodyError("Request body is too large", 413);
      chunks.push(next.value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  const contentType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  if (contentType === "application/json") {
    try {
      const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes));
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
        throw new NewsletterBodyError("Invalid request", 400);
      return parsed as Record<string, unknown>;
    } catch (error) {
      if (error instanceof NewsletterBodyError) throw error;
      throw new NewsletterBodyError("Invalid request", 400);
    }
  }
  if (contentType === "application/x-www-form-urlencoded") {
    return objectFromEntries(new URLSearchParams(new TextDecoder().decode(bytes)).entries());
  }
  if (contentType === "multipart/form-data") {
    try {
      const boundedRequest = new Request(request.url, {
        method: "POST",
        headers: request.headers,
        body: bytes,
      });
      return objectFromEntries((await boundedRequest.formData()).entries());
    } catch {
      throw new NewsletterBodyError("Invalid request", 400);
    }
  }
  throw new NewsletterBodyError("Unsupported content type", 415);
}

const localAttempts = new Map<string, { count: number; expires: number }>();
export function withinAbuseLimit(
  key: string,
  now = Date.now(),
  limit = 5,
  windowMs = 10 * 60 * 1000,
) {
  const current = localAttempts.get(key);
  if (!current || current.expires <= now) {
    localAttempts.set(key, { count: 1, expires: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

type RedisReply = string | number | null;
type RedisResult = { ok: true; replies: RedisReply[] } | { ok: false };

function namespacedKey(env: Env, kind: "rate" | "idempotency", value: string) {
  return `${env.VALKEY_KEY_PREFIX}newsletter:${kind}:${value}`;
}

function command(parts: Array<string | number>) {
  return `*${parts.length}\r\n${parts
    .map((part) => {
      const value = String(part);
      return `$${Buffer.byteLength(value)}\r\n${value}\r\n`;
    })
    .join("")}`;
}

function parseRedisValue(buffer: string): { value: RedisReply; rest: string } | null {
  const lineEnd = buffer.indexOf("\r\n");
  if (lineEnd < 0) return null;
  const prefix = buffer[0];
  const line = buffer.slice(1, lineEnd);
  if (prefix === ":") return { value: Number(line), rest: buffer.slice(lineEnd + 2) };
  if (prefix === "+") return { value: line, rest: buffer.slice(lineEnd + 2) };
  if (prefix === "-") throw new Error(line);
  if (prefix === "$") {
    const length = Number(line);
    if (length === -1) return { value: null, rest: buffer.slice(lineEnd + 2) };
    if (!Number.isSafeInteger(length) || length < 0)
      throw new Error("Invalid Valkey bulk response");
    const start = lineEnd + 2;
    const end = start + length;
    if (buffer.length < end + 2) return null;
    return { value: buffer.slice(start, end), rest: buffer.slice(end + 2) };
  }
  return null;
}

async function valkeyCommands(
  url: URL,
  commands: Array<Array<string | number>>,
  timeoutMs = 800,
): Promise<RedisResult> {
  if (url.protocol !== "redis:" && url.protocol !== "rediss:") return { ok: false };
  const port = Number(url.port || (url.protocol === "rediss:" ? 6380 : 6379));
  const socket =
    url.protocol === "rediss:"
      ? tls.connect({ host: url.hostname, port, rejectUnauthorized: true })
      : net.connect({ host: url.hostname, port });
  const authenticated = Boolean(url.username || url.password);
  const pending = authenticated
    ? [
        ["AUTH", decodeURIComponent(url.username || "default"), decodeURIComponent(url.password)],
        ...commands,
      ]
    : commands;
  return await new Promise<RedisResult>((resolve) => {
    let buffer = "";
    let index = 0;
    const replies: RedisReply[] = [];
    let settled = false;
    const finish = (result: RedisResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      socket.destroy();
      resolve(result);
    };
    const timer = setTimeout(() => finish({ ok: false }), timeoutMs);
    socket.on("error", () => finish({ ok: false }));
    socket.on("data", (chunk) => {
      buffer += chunk.toString();
      try {
        while (index < pending.length) {
          const parsed = parseRedisValue(buffer);
          if (!parsed) return;
          buffer = parsed.rest;
          replies.push(parsed.value);
          index += 1;
          if (index < pending.length) socket.write(command(pending[index]));
        }
        finish({ ok: true, replies: replies.slice(authenticated ? 1 : 0) });
      } catch {
        finish({ ok: false });
      }
    });
    const start = () => socket.write(command(pending[0]));
    if (url.protocol === "rediss:") socket.once("secureConnect", start);
    else socket.once("connect", start);
  });
}

async function valkeyRateLimit(key: string, limit: number, windowSeconds: number) {
  const env = parseEnv();
  if (!env.VALKEY_URL) return null;
  const url = new URL(env.VALKEY_URL);
  const redisKey = namespacedKey(env, "rate", key);
  // EXPIRE NX makes the counter/window initialization safe when two workers
  // receive the first request concurrently. The key is always scoped to the
  // application-owned Valkey prefix rather than the URL database pathname.
  const increment = await valkeyCommands(url, [
    ["INCR", redisKey],
    ["EXPIRE", redisKey, windowSeconds, "NX"],
  ]);
  if (!increment.ok) return null;
  const count = increment.replies[0];
  const expiry = increment.replies[1];
  if (typeof count !== "number" || !Number.isSafeInteger(count)) return null;
  if (typeof expiry !== "number" || (expiry !== 0 && expiry !== 1)) return null;
  if (count > limit) return false;
  return true;
}

async function valkeyClaim(key: string, ttlSeconds: number) {
  const env = parseEnv();
  if (!env.VALKEY_URL) return null;
  const url = new URL(env.VALKEY_URL);
  const redisKey = namespacedKey(env, "idempotency", key);
  const result = await valkeyCommands(url, [["SET", redisKey, "1", "NX", "EX", ttlSeconds]]);
  if (!result.ok) return null;
  return result.replies[0] === null ? ("duplicate" as const) : ("claimed" as const);
}

async function valkeyRelease(key: string) {
  const env = parseEnv();
  if (!env.VALKEY_URL) return;
  const url = new URL(env.VALKEY_URL);
  await valkeyCommands(url, [["DEL", namespacedKey(env, "idempotency", key)]]);
}

export function kitConfigured(env: NodeJS.ProcessEnv | Env = process.env) {
  return env.KIT_ENABLED === "true" && Boolean(env.KIT_API_KEY && env.KIT_FORM_ID);
}

export async function withinDistributedAbuseLimit(key: string) {
  const env = parseEnv();
  if (env.VALKEY_URL) {
    const distributed = await valkeyRateLimit(
      key,
      env.NEWSLETTER_RATE_LIMIT,
      env.NEWSLETTER_RATE_WINDOW_SECONDS,
    );
    if (distributed !== null) return { allowed: distributed, mode: "valkey" as const };
    return { allowed: false, mode: "valkey-unavailable" as const };
  }
  return {
    allowed: withinAbuseLimit(
      key,
      Date.now(),
      env.NEWSLETTER_RATE_LIMIT,
      env.NEWSLETTER_RATE_WINDOW_SECONDS * 1000,
    ),
    mode: "local-development" as const,
  };
}

const localIdempotency = new Map<string, number>();
export async function submitNewsletter(
  email: string,
  options: { idempotencyKey?: string; timeoutMs?: number } = {},
): Promise<NewsletterResult> {
  const env = parseEnv();
  if (!kitConfigured(env))
    return {
      status: "unconfigured",
      message: "Newsletter signup is not enabled in this environment.",
    };
  const key = options.idempotencyKey;
  let claimed = false;
  let distributedClaim = false;
  if (key) {
    if (env.VALKEY_URL) {
      const claim = await valkeyClaim(key, IDEMPOTENCY_TTL_SECONDS);
      if (!claim)
        return { status: "failed", message: "Newsletter signup is temporarily unavailable." };
      if (claim === "duplicate")
        return { status: "duplicate", message: "This signup has already been received." };
      claimed = true;
      distributedClaim = true;
    } else {
      const expires = localIdempotency.get(key);
      if (expires && expires > Date.now())
        return { status: "duplicate", message: "This signup has already been received." };
      localIdempotency.set(key, Date.now() + IDEMPOTENCY_TTL_SECONDS * 1000);
      claimed = true;
    }
  }
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    Math.max(500, Math.min(options.timeoutMs ?? 4000, 8000)),
  );
  try {
    const response = await fetch(
      `${env.KIT_API_URL.replace(/\/$/, "")}/forms/${encodeURIComponent(env.KIT_FORM_ID!)}/subscribe`,
      {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({
          api_key: env.KIT_API_KEY,
          email,
          tags: ["paper-and-slate"],
          fields: { consent: true, consent_source: "paper-and-slate-web" },
        }),
        signal: controller.signal,
      },
    );
    if (!response.ok) {
      if (claimed) {
        if (distributedClaim) await valkeyRelease(key!);
        else localIdempotency.delete(key!);
      }
      return { status: "failed", message: "Newsletter signup is temporarily unavailable." };
    }
    return { status: "subscribed", message: "You are subscribed. Thank you." };
  } catch {
    if (claimed) {
      if (distributedClaim) await valkeyRelease(key!);
      else localIdempotency.delete(key!);
    }
    return { status: "failed", message: "Newsletter signup is temporarily unavailable." };
  } finally {
    clearTimeout(timer);
  }
}
