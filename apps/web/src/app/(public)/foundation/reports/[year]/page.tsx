import { notFound } from "next/navigation";
import { getPublicReport, publicReports } from "@paper-and-slate/content";

export function generateStaticParams() {
  return publicReports.map((report) => ({ year: String(report.year) }));
}

export default async function Report({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  const report = getPublicReport(Number(year));

  if (!report) notFound();

  return (
    <main id="main-content" className="page-wrap container">
      <div className="page-header">
        <p className="eyebrow">Foundation / Reports · {report.status}</p>
        <h1>{report.title}</h1>
        <p>{report.summary}</p>
      </div>
      <article className="prose">
        <p>
          This report is pending verified publication. No historical facts or metrics are asserted.
        </p>
      </article>
    </main>
  );
}
