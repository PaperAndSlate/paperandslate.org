import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getStandardsItemDetail,
  getStandardsSourceDetail,
  searchStandards,
} from "../apps/web/src/lib/standards-api";

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("Standards API contract adapter", () => {
  it("pins search to the requested release, normalizes bearer auth, and exposes only permitted text", async () => {
    vi.stubEnv("STANDARDS_API_URL", "https://standards.example.test");
    vi.stubEnv("LOCAL_API_BEARER", "test-token");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      response({
        meta: { releaseId: "candidate-release", candidateOnly: true },
        data: [
          {
            resource: {
              id: "node-1",
              release: { id: "candidate-release" },
              code: "K5.N.1",
              source: {
                role: "fixture",
                sourceLocator: { kind: "json", jsonPointer: "/records/0" },
              },
              texts: [
                { rights: "restricted", value: "restricted wording" },
                { rights: "public-api", value: "permitted wording" },
              ],
            },
          },
        ],
      }),
    );

    const result = await searchStandards({ release: "candidate-release", q: "numeric" });
    const [url, init] = fetchMock.mock.calls[0] ?? [];

    expect(result.records[0]).toMatchObject({
      id: "node-1",
      releaseId: "candidate-release",
      sourceLocator: "json · /records/0",
      text: "permitted wording",
    });
    expect(result.records[0]?.text).not.toContain("restricted");
    expect(String(url)).toContain("release=candidate-release");
    expect(String(url)).toContain("q=numeric");
    expect((init as RequestInit).headers).toEqual({ Authorization: "Bearer test-token" });
    expect((init as RequestInit).signal).toBeInstanceOf(AbortSignal);
  });

  it("fails closed when a search record belongs to another release", async () => {
    vi.stubEnv("STANDARDS_API_URL", "https://standards.example.test");
    vi.stubEnv("LOCAL_API_BEARER", "Bearer test-token");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      response({
        meta: { releaseId: "candidate-release", candidateOnly: true },
        data: [{ resource: { id: "node-1", releaseId: "other-release" } }],
      }),
    );

    const result = await searchStandards({ release: "candidate-release" });

    expect(result.records).toEqual([]);
    expect(result.unavailable).toMatch(/temporarily unavailable/i);
  });

  it("uses the configured release for direct item requests and keeps source detail publication state truthful", async () => {
    vi.stubEnv("STANDARDS_API_URL", "https://standards.example.test");
    vi.stubEnv("LOCAL_API_BEARER", "test-token");
    const fetchMock = vi.spyOn(globalThis, "fetch");
    fetchMock
      .mockResolvedValueOnce(
        response({
          meta: { releaseId: "configured-release" },
          data: {
            resource: {
              id: "node-1",
              releaseId: "configured-release",
              code: "K5.N.1",
              texts: [],
            },
          },
        }),
      )
      .mockResolvedValueOnce(response({ meta: { releaseId: "configured-release" }, data: [] }))
      .mockResolvedValueOnce(response({ meta: { releaseId: "configured-release" }, data: [] }))
      .mockResolvedValueOnce(
        response({
          meta: { releaseId: "configured-release" },
          data: {
            release: { id: "configured-release", stable: false, public: false },
            provenance: { sourceLocator: "sources/catalog.json#/0" },
            rights: { api: "metadata-only", fullText: "denied" },
            availability: { metadata: true, fullText: false },
          },
        }),
      );
    vi.stubEnv("STANDARDS_RELEASE_ID", "configured-release");

    const item = await getStandardsItemDetail("node-1");
    expect(item.releaseId).toBe("configured-release");
    expect(item.provenance.sourceLocator?.locator).toBe("sources/catalog.json#/0");

    fetchMock.mockReset();
    fetchMock.mockResolvedValue(
      response({
        meta: { releaseId: "configured-release", candidateOnly: false },
        data: {
          id: "source-1",
          release: { id: "configured-release", stable: true, public: true, status: "stable" },
          name: "Published source",
          rights: { api: "public-api", fullText: "denied" },
          availability: { metadata: true, fullText: false },
        },
      }),
    );

    const source = await getStandardsSourceDetail("source-1");
    expect(source.candidateOnly).toBe(false);
    expect(source.status).toBe("stable");
  });
});
