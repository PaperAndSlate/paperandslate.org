import { describe, expect, it, vi } from "vitest";
import { parseEnv } from "../packages/config/src/env";
import {
  allowedOrigin,
  clientAddress,
  readNewsletterBody,
  submitNewsletter,
  validateNewsletter,
  withinAbuseLimit,
} from "../apps/web/src/lib/newsletter";
describe("newsletter safety", () => {
  it("requires valid email, consent and empty honeypot", () => {
    expect(validateNewsletter({ email: "person@example.com", consent: true, website: "" }).ok).toBe(
      true,
    );
    expect(validateNewsletter({ email: "bad", consent: true }).ok).toBe(false);
    expect(validateNewsletter({ email: "person@example.com", consent: false }).ok).toBe(false);
    expect(
      validateNewsletter({ email: "person@example.com", consent: true, website: "bot" }).ok,
    ).toBe(false);
  });

  it("fails closed for absent and wrong origins while allowing a verified same-origin browser", () => {
    const request = new Request("https://paper.example.test/api/newsletter", { method: "POST" });
    expect(allowedOrigin(request)).toBe(false);
    expect(
      allowedOrigin(new Request(request, { headers: { "sec-fetch-site": "same-origin" } })),
    ).toBe(true);
    expect(
      allowedOrigin(new Request(request, { headers: { origin: "https://other.example.test" } })),
    ).toBe(false);
  });

  it("does not use arbitrary forwarded addresses unless the proxy contract is enabled", () => {
    const request = new Request("https://paper.example.test/api/newsletter", {
      headers: { "x-forwarded-for": "203.0.113.8", "x-real-ip": "198.51.100.4" },
    });
    expect(clientAddress(request)).toBe("anonymous");
    expect(
      clientAddress(request, {
        ...parseEnv(),
        TRUSTED_PROXY_MODE: "coolify",
      }),
    ).toBe("198.51.100.4");
    expect(
      clientAddress(
        new Request("https://paper.example.test/api/newsletter", {
          headers: { "x-forwarded-for": "203.0.113.8" },
        }),
        {
          ...parseEnv(),
          TRUSTED_PROXY_MODE: "coolify",
        },
      ),
    ).toBe("anonymous");
  });

  it("bounds chunked bodies and supports JSON and URL-encoded forms", async () => {
    const json = await readNewsletterBody(
      new Request("https://paper.example.test/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: "person@example.com", consent: true }),
      }),
    );
    expect(json).toMatchObject({ email: "person@example.com", consent: true });
    const encoded = await readNewsletterBody(
      new Request("https://paper.example.test/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: "email=person%40example.com&consent=on",
      }),
    );
    expect(encoded).toEqual({ email: "person@example.com", consent: "on" });
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('{"email":"person@example.com",'));
        controller.enqueue(new TextEncoder().encode('"consent":true}'));
        controller.close();
      },
    });
    await expect(
      readNewsletterBody(
        new Request("https://paper.example.test/api/newsletter", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: stream,
          // Node's Request requires this flag for a streaming body.
          duplex: "half",
        } as RequestInit & { duplex: "half" }),
      ),
    ).resolves.toMatchObject({ email: "person@example.com" });
    const oversized = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array(9000));
        controller.close();
      },
    });
    await expect(
      readNewsletterBody(
        new Request("https://paper.example.test/api/newsletter", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: oversized,
          duplex: "half",
        } as RequestInit & { duplex: "half" }),
      ),
    ).rejects.toMatchObject({ status: 413 });
  });

  it("uses idempotency for successful retries and bounds local development rate state", async () => {
    const previous = { ...process.env };
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    process.env.KIT_ENABLED = "true";
    process.env.KIT_API_KEY = "test-key";
    process.env.KIT_FORM_ID = "test-form";
    delete process.env.VALKEY_URL;
    try {
      const first = await submitNewsletter("person@example.com", {
        idempotencyKey: "retry-key-123",
      });
      const second = await submitNewsletter("person@example.com", {
        idempotencyKey: "retry-key-123",
      });
      expect(first.status).toBe("subscribed");
      expect(second.status).toBe("duplicate");
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const key = `test-${Date.now()}`;
      expect(withinAbuseLimit(key, 100, 2, 1000)).toBe(true);
      expect(withinAbuseLimit(key, 200, 2, 1000)).toBe(true);
      expect(withinAbuseLimit(key, 300, 2, 1000)).toBe(false);
      expect(withinAbuseLimit(key, 1200, 2, 1000)).toBe(true);
    } finally {
      vi.unstubAllGlobals();
      for (const key of Object.keys(process.env)) if (!(key in previous)) delete process.env[key];
      Object.assign(process.env, previous);
    }
  });

  it("returns a safe failure on provider errors", async () => {
    const previous = { ...process.env };
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("provider down")));
    process.env.KIT_ENABLED = "true";
    process.env.KIT_API_KEY = "test-key";
    process.env.KIT_FORM_ID = "test-form";
    delete process.env.VALKEY_URL;
    try {
      await expect(
        submitNewsletter("person@example.com", { idempotencyKey: "error-key-123" }),
      ).resolves.toEqual({
        status: "failed",
        message: "Newsletter signup is temporarily unavailable.",
      });
    } finally {
      vi.unstubAllGlobals();
      for (const key of Object.keys(process.env)) if (!(key in previous)) delete process.env[key];
      Object.assign(process.env, previous);
    }
  });
});
