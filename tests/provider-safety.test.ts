import { describe, expect, it } from "vitest";
import {
  assertSafeProviderUrl,
  readBoundedJson,
  readBoundedResponse,
} from "../packages/config/src/provider-safety";

describe("provider endpoint safety", () => {
  it("rejects private, credential-bearing, non-HTTPS, and query-bearing endpoints", () => {
    expect(() => assertSafeProviderUrl("http://provider.example.test", "provider")).toThrow();
    expect(() => assertSafeProviderUrl("https://127.0.0.1", "provider")).toThrow();
    expect(() => assertSafeProviderUrl("https://localhost.", "provider")).toThrow();
    expect(() =>
      assertSafeProviderUrl("https://user:password@provider.test", "provider"),
    ).toThrow();
    expect(() =>
      assertSafeProviderUrl("https://provider.test/?token=secret", "provider"),
    ).toThrow();
    expect(
      assertSafeProviderUrl("http://provider.example.test", "provider", { allowHttp: true })
        .protocol,
    ).toBe("http:");
  });

  it("bounds streamed provider response bodies before parsing", async () => {
    await expect(readBoundedJson(new Response('{"ok":true}'), 100)).resolves.toEqual({ ok: true });
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array(101));
        controller.close();
      },
    });
    await expect(readBoundedResponse(new Response(stream), 100)).rejects.toThrow(/byte limit/i);
  });

  it("cancels an oversized streamed response", async () => {
    let canceled = false;
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        controller.enqueue(new Uint8Array(101));
      },
      cancel() {
        canceled = true;
      },
    });
    await expect(readBoundedResponse(new Response(stream), 100)).rejects.toThrow(/byte limit/i);
    expect(canceled).toBe(true);
  });
});
