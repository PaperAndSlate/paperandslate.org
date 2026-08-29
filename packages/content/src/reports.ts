import { reportSchema, type Report } from "./models";
export const reports: Report[] = [
  {
    year: 2026,
    title: "2026 transparency report",
    status: "planned",
    summary: "A report archive entry is reserved; no annual report has been published.",
    highlights: [
      "Progress, governance, funding, and security sections are planned for a verified report.",
    ],
    canonicalUrl: "/foundation/reports/2026",
  },
].map((report) => reportSchema.parse(report));
export const publicReports = reports.filter((report) => report.status === "published");
export const getPublicReport = (year: number) =>
  publicReports.find((report) => report.year === year);
/** Compatibility alias for public report lookup. */
export const getReport = getPublicReport;
