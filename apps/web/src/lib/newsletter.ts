import net from "node:net";
import tls from "node:tls";
import { parseEnv } from "@paper-and-slate/config";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export type NewsletterInput = {
  email?: unknown;
  consent?: unknown;
  website?: unknown;
  idempotencyKey?: unknown;
};
export type NewsletterResult =
  | { status: "subscribed" | "duplicate"; message: string }
  | { status: "unconfigured" | "failed"; message: string };

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

export function kitConfigured(env: NodeJS.ProcessEnv = process.env) {
  return env.KIT_ENABLED === "true" && Boolean(env.KIT_API_KEY && env.KIT_FORM_ID);
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

export function allowedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

function command(parts: Array<string | number>) {
  return `*${parts.length}\r\n${parts.map((part) => `$${String(part).length}\r\n${part}\r\n`).join("")}`;
}

function readRedisValue(buffer: string): { value: string | number | null; rest: string } | null {
  const lineEnd = buffer.indexOf("\r\n");
  if (lineEnd < 0) return null;
  const prefix = buffer[0];
  const line = buffer.slice(1, lineEnd);
  if (prefix === ":") return { value: Number(line), rest: buffer.slice(lineEnd + 2) };
  if (prefix === "+") return { value: line, rest: buffer.slice(lineEnd + 2) };
  if (prefix === "-") return { value: null, rest: buffer.slice(lineEnd + 2) };
  return null;
}

async function valkeyRateLimit(key: string, limit: number, windowSeconds: number) {
  const env = parseEnv();
  if (!env.VALKEY_URL) return null;
  const url = new URL(env.VALKEY_URL);
  const port = Number(url.port || (url.protocol === "rediss:" ? 6380 : 6379));
  const socket =
    url.protocol === "rediss:"
      ? tls.connect({ host: url.hostname, port, rejectUnauthorized: true })
      : net.connect({ host: url.hostname, port });
  const prefix = url.pathname.replace(/^\//, "") || "paper-slate";
  const redisKey = `${prefix}:newsletter:rate:${key}`;
  return await new Promise<boolean | null>((resolve) => {
    let buffer = "";
    let stage: "auth" | "incr" | "expire" | "done" = url.username || url.password ? "auth" : "incr";
    let settled = false;
    const finish = (value: boolean | null) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(value);
    };
    const timer = setTimeout(() => finish(false), 800);
    socket.on("error", () => {
      clearTimeout(timer);
      finish(null);
    });
    socket.on("data", (chunk) => {
      buffer += chunk.toString();
      while (true) {
        const parsed = readRedisValue(buffer);
        if (!parsed) return;
        buffer = parsed.rest;
        if (stage === "auth") {
          if (parsed.value === null) {
            clearTimeout(timer);
            finish(null);
            return;
          }
          stage = "incr";
          socket.write(command(["INCR", redisKey]));
        } else if (stage === "incr") {
          const count = typeof parsed.value === "number" ? parsed.value : limit + 1;
          if (count > limit) {
            clearTimeout(timer);
            finish(false);
            return;
          }
          if (count === 1) {
            stage = "expire";
            socket.write(command(["EXPIRE", redisKey, windowSeconds]));
          } else {
            clearTimeout(timer);
            finish(true);
            return;
          }
        } else {
          clearTimeout(timer);
          finish(stage === "expire" && parsed.value !== null);
          return;
        }
      }
    });
    const start = () => {
      if (stage === "auth")
        socket.write(
          command([
            "AUTH",
            decodeURIComponent(url.username || "default"),
            decodeURIComponent(url.password),
          ]),
        );
      else socket.write(command(["INCR", redisKey]));
    };
    if (url.protocol === "rediss:") socket.once("secureConnect", start);
    else socket.once("connect", start);
  });
}

export async function withinDistributedAbuseLimit(key: string) {
  const env = parseEnv();
  const distributed = await valkeyRateLimit(
    key,
    env.NEWSLETTER_RATE_LIMIT,
    env.NEWSLETTER_RATE_WINDOW_SECONDS,
  );
  if (distributed !== null) return { allowed: distributed, mode: "valkey" as const };
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

const idempotency = new Map<string, number>();
export async function submitNewsletter(
  email: string,
  options: { idempotencyKey?: string; timeoutMs?: number } = {},
): Promise<NewsletterResult> {
  const env = parseEnv();
  if (!kitConfigured())
    return {
      status: "unconfigured",
      message: "Newsletter signup is not enabled in this environment.",
    };
  const key = options.idempotencyKey;
  if (key && idempotency.has(key))
    return { status: "duplicate", message: "This signup has already been received." };
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
    if (!response.ok)
      return { status: "failed", message: "Newsletter signup is temporarily unavailable." };
    if (key) idempotency.set(key, Date.now());
    return { status: "subscribed", message: "You are subscribed. Thank you." };
  } catch {
    return { status: "failed", message: "Newsletter signup is temporarily unavailable." };
  } finally {
    clearTimeout(timer);
  }
}
