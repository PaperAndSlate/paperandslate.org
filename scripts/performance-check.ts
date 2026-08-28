import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import {
  sourceDirtyPaths,
  sourceRevisionMatchesCurrent,
  sourceWorktreeClean,
} from "./source-state";

export type PerformanceBudgets = {
  javascriptKb: number;
  cssKb: number;
  imageKb: number;
  fontKb?: number;
  requestCount: number;
  lighthousePerformance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  lcpMs: number;
  cls: number;
  tbtMs: number;
  inpMs?: number;
};

type LighthouseAudit = {
  numericValue?: number;
  details?: {
    items?: Array<{
      resourceType?: string;
      transferSize?: number;
      requestCount?: number;
    }>;
  };
};

export type LighthouseResult = {
  finalUrl?: string;
  requestedUrl?: string;
  categories?: Record<string, { score?: number }>;
  audits?: Record<string, LighthouseAudit>;
};

export type PerformanceMetrics = {
  performance?: number;
  accessibility?: number;
  bestPractices?: number;
  seo?: number;
  lcpMs?: number;
  cls?: number;
  tbtMs?: number;
  inpMs?: number;
  javascriptKb: number;
  cssKb: number;
  imageKb: number;
  fontKb: number;
  requestCount: number;
  inpMetric: "inp" | "tbt";
};

export type PerformanceFailure = {
  route: string;
  metric: string;
  actual: number | undefined;
  budget: number | undefined;
  reportPath: string;
};

function numeric(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export function performanceMetrics(result: LighthouseResult): PerformanceMetrics {
  const summaryItems = result.audits?.["resource-summary"]?.details?.items ?? [];
  const networkItems = result.audits?.["network-requests"]?.details?.items ?? [];
  const items = summaryItems.length > 0 ? summaryItems : networkItems;
  const bytesFor = (type: string) =>
    items
      .filter((item) => item.resourceType?.toLowerCase() === type)
      .reduce((total, item) => total + (numeric(item.transferSize) ?? 0), 0) / 1024;
  const summaryTotal = summaryItems.find((item) => item.resourceType?.toLowerCase() === "total");
  const requestCount =
    numeric(summaryTotal?.requestCount) ??
    (summaryItems.length > 0
      ? summaryItems.reduce((total, item) => total + (numeric(item.requestCount) ?? 0), 0)
      : networkItems.length);
  const inp =
    numeric(result.audits?.["interaction-to-next-paint"]?.numericValue) ??
    numeric(result.audits?.["experimental-interaction-to-next-paint"]?.numericValue);
  return {
    performance: numeric(result.categories?.performance?.score),
    accessibility: numeric(result.categories?.accessibility?.score),
    bestPractices: numeric(result.categories?.["best-practices"]?.score),
    seo: numeric(result.categories?.seo?.score),
    lcpMs: numeric(result.audits?.["largest-contentful-paint"]?.numericValue),
    cls: numeric(result.audits?.["cumulative-layout-shift"]?.numericValue),
    tbtMs: numeric(result.audits?.["total-blocking-time"]?.numericValue),
    inpMs: inp,
    javascriptKb: bytesFor("script"),
    cssKb: bytesFor("stylesheet"),
    imageKb: bytesFor("image"),
    fontKb: bytesFor("font"),
    requestCount,
    inpMetric: inp === undefined ? "tbt" : "inp",
  };
}

export function evaluatePerformance(
  result: LighthouseResult,
  budgets: PerformanceBudgets,
  reportPath = "<fixture>",
): { metrics: PerformanceMetrics; failures: PerformanceFailure[] } {
  const metrics = performanceMetrics(result);
  const route = result.finalUrl ?? result.requestedUrl ?? "<unknown route>";
  const checks: Array<[string, number | undefined, number | undefined, "min" | "max"]> = [
    ["performance", metrics.performance, budgets.lighthousePerformance, "min"],
    ["accessibility", metrics.accessibility, budgets.accessibility, "min"],
    ["best-practices", metrics.bestPractices, budgets.bestPractices, "min"],
    ["seo", metrics.seo, budgets.seo, "min"],
    ["largest-contentful-paint", metrics.lcpMs, budgets.lcpMs, "max"],
    ["cumulative-layout-shift", metrics.cls, budgets.cls, "max"],
    ["total-blocking-time", metrics.tbtMs, budgets.tbtMs, "max"],
    ["javascript-kb", metrics.javascriptKb, budgets.javascriptKb, "max"],
    ["css-kb", metrics.cssKb, budgets.cssKb, "max"],
    ["image-kb", metrics.imageKb, budgets.imageKb, "max"],
    ["request-count", metrics.requestCount, budgets.requestCount, "max"],
  ];
  if (budgets.fontKb !== undefined) checks.push(["font-kb", metrics.fontKb, budgets.fontKb, "max"]);
  if (budgets.inpMs !== undefined && metrics.inpMs !== undefined)
    checks.push(["interaction-to-next-paint", metrics.inpMs, budgets.inpMs, "max"]);
  const failures = checks.flatMap(([metric, actual, budget, direction]) => {
    if (actual === undefined || budget === undefined) {
      return [{ route, metric, actual, budget, reportPath }];
    }
    const passed = direction === "min" ? actual >= budget : actual <= budget;
    return passed ? [] : [{ route, metric, actual, budget, reportPath }];
  });
  return { metrics, failures };
}

function readBudgets(root: string) {
  const parsed = YAML.parse(
    fs.readFileSync(path.join(root, "config/performance-budgets.yml"), "utf8"),
  ) as { budgets?: PerformanceBudgets };
  const budgets = parsed.budgets;
  if (
    !budgets ||
    Object.values(budgets).some((value) => typeof value !== "number" || !Number.isFinite(value))
  )
    throw new Error("Performance budgets are missing numeric values");
  return budgets;
}

function git(args: string[]) {
  try {
    return execFileSync(process.platform === "win32" ? "git.exe" : "git", args, {
      cwd: process.cwd(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

function sourceStatus(root: string) {
  try {
    return execFileSync(
      process.platform === "win32" ? "git.exe" : "git",
      ["status", "--porcelain", "--untracked-files=all"],
      { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    ).trimEnd();
  } catch {
    return null;
  }
}

function main() {
  const root = process.cwd();
  const budgets = readBudgets(root);
  const lighthouseDir = path.join(root, ".generated/launch/lighthouse");
  const lighthouseManifestPath = path.join(lighthouseDir, "lighthouse-run.json");
  const lighthouseManifest = fs.existsSync(lighthouseManifestPath)
    ? (JSON.parse(fs.readFileSync(lighthouseManifestPath, "utf8")) as {
        status?: string;
        gitSha?: string;
        reportCount?: number;
      })
    : null;
  if (lighthouseManifest?.status !== "passed")
    throw new Error(
      "Lighthouse evidence must be a passed run before performance budgets are checked",
    );
  const currentSource = git(["rev-parse", "HEAD"]);
  if (!sourceRevisionMatchesCurrent(root, lighthouseManifest.gitSha, currentSource))
    throw new Error(
      `Lighthouse evidence identity does not match the current source: expected ${currentSource ?? "missing"}, got ${lighthouseManifest.gitSha ?? "missing"}`,
    );
  const reports = fs.existsSync(lighthouseDir)
    ? fs
        .readdirSync(lighthouseDir)
        .filter((file) => /^lhr-.*\.json$/.test(file) || /\.report\.json$/.test(file))
    : [];
  if (reports.length === 0)
    throw new Error("No Lighthouse JSON evidence found; run pnpm lighthouse first");
  if (
    lighthouseManifest.reportCount !== undefined &&
    lighthouseManifest.reportCount !== reports.length
  )
    throw new Error(
      `Lighthouse report count mismatch: manifest=${lighthouseManifest.reportCount}, files=${reports.length}`,
    );
  const evaluated = reports.map((file) => {
    const reportPath = path.join(lighthouseDir, file);
    const result = JSON.parse(fs.readFileSync(reportPath, "utf8")) as LighthouseResult;
    return {
      file,
      route: result.finalUrl ?? result.requestedUrl ?? "<unknown route>",
      ...evaluatePerformance(result, budgets, path.relative(root, reportPath)),
    };
  });
  const failures = evaluated.flatMap((item) => item.failures);
  const status = sourceStatus(root);
  const source = {
    commit: currentSource,
    tree: git(["rev-parse", "HEAD^{tree}"]),
    worktreeClean: status !== null && sourceWorktreeClean(status),
    dirtyPaths: status === null ? [] : sourceDirtyPaths(status),
    lighthouseGitSha: lighthouseManifest.gitSha ?? null,
  };
  const routeSummary = Object.values(
    evaluated.reduce<Record<string, { runs: number; maximums: Partial<PerformanceMetrics> }>>(
      (summary, item) => {
        const current = (summary[item.route] ??= { runs: 0, maximums: {} });
        current.runs += 1;
        for (const key of [
          "lcpMs",
          "cls",
          "tbtMs",
          "inpMs",
          "javascriptKb",
          "cssKb",
          "imageKb",
          "fontKb",
          "requestCount",
        ] as const) {
          const value = item.metrics[key];
          if (value !== undefined)
            current.maximums[key] = Math.max(Number(current.maximums[key] ?? 0), value);
        }
        return summary;
      },
      {},
    ),
  );
  fs.writeFileSync(
    path.join(root, ".generated/launch/performance-summary.json"),
    `${JSON.stringify({ schemaVersion: 2, budgets, source, reports: evaluated, routeSummary }, null, 2)}\n`,
  );
  if (failures.length > 0) {
    throw new Error(
      failures
        .map(
          (failure) =>
            `Performance budget failed for ${failure.route}: ${failure.metric}=${failure.actual}, budget=${failure.budget}, report=${failure.reportPath}`,
        )
        .join("\n"),
    );
  }
  console.log(
    `Validated ${reports.length} Lighthouse runs per route against category, LCP, CLS, TBT/INP, JS, CSS, image, font, and request budgets.`,
  );
}

if (process.argv[1]?.replaceAll("\\", "/").endsWith("/performance-check.ts")) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
