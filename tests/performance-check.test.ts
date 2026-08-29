import { describe, expect, it } from "vitest";
import {
  evaluatePerformance,
  performanceMetrics,
  summarizePerformance,
  type LighthouseResult,
  type PerformanceBudgets,
} from "../scripts/performance-check";

const budgets: PerformanceBudgets = {
  javascriptKb: 250,
  cssKb: 100,
  imageKb: 500,
  fontKb: 150,
  requestCount: 80,
  lighthousePerformance: 0.9,
  accessibility: 0.95,
  bestPractices: 0.95,
  seo: 0.95,
  lcpMs: 2500,
  cls: 0.1,
  tbtMs: 200,
  inpMs: 500,
};

function fixture(overrides: Partial<LighthouseResult> = {}): LighthouseResult {
  return {
    finalUrl: "https://staging.example.test/",
    categories: {
      performance: { score: 1 },
      accessibility: { score: 1 },
      "best-practices": { score: 1 },
      seo: { score: 1 },
    },
    audits: {
      "largest-contentful-paint": { numericValue: 500 },
      "cumulative-layout-shift": { numericValue: 0 },
      "total-blocking-time": { numericValue: 0 },
      "interaction-to-next-paint": { numericValue: 100 },
      "resource-summary": {
        details: {
          items: [
            { resourceType: "total", requestCount: 4, transferSize: 40_000 },
            { resourceType: "script", requestCount: 1, transferSize: 10_000 },
            { resourceType: "stylesheet", requestCount: 1, transferSize: 10_000 },
            { resourceType: "image", requestCount: 1, transferSize: 10_000 },
            { resourceType: "font", requestCount: 1, transferSize: 10_000 },
          ],
        },
      },
    },
    ...overrides,
  };
}

describe("performance budget enforcement", () => {
  it("passes all declared category, timing, resource, and request budgets", () => {
    expect(evaluatePerformance(fixture(), budgets).failures).toEqual([]);
  });

  it("reports a single resource-class failure with route and budget", () => {
    const result = evaluatePerformance(
      fixture({
        audits: {
          ...fixture().audits,
          "resource-summary": {
            details: {
              items: [{ resourceType: "script", requestCount: 1, transferSize: 400 * 1024 }],
            },
          },
        },
      }),
      budgets,
      "fixture.json",
    );
    expect(result.failures).toEqual([
      expect.objectContaining({
        route: "https://staging.example.test/",
        metric: "javascript-kb",
        budget: 250,
        reportPath: "fixture.json",
      }),
    ]);
  });

  it("reports aggregate timing and resource failures together", () => {
    const result = evaluatePerformance(
      fixture({
        categories: {
          performance: { score: 0.5 },
          accessibility: { score: 1 },
          "best-practices": { score: 1 },
          seo: { score: 1 },
        },
        audits: {
          ...fixture().audits,
          "largest-contentful-paint": { numericValue: 3000 },
        },
      }),
      budgets,
    );
    expect(result.failures.map((failure) => failure.metric)).toContain("performance");
    expect(result.failures.map((failure) => failure.metric)).toContain("largest-contentful-paint");
  });

  it("keeps route identity in the aggregate summary", () => {
    const metrics = performanceMetrics(fixture());
    expect(
      summarizePerformance([
        { route: "https://staging.example.test/", metrics },
        { route: "https://staging.example.test/", metrics: { ...metrics, lcpMs: 900 } },
      ]),
    ).toEqual([
      expect.objectContaining({
        route: "https://staging.example.test/",
        runs: 2,
        maximums: expect.objectContaining({ lcpMs: 900 }),
      }),
    ]);
  });
});
