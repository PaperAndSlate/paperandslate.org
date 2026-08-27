import { PageHeader } from "../../../../components/page-primitives";
export default function Reports() {
  return (
    <main id="main-content" className="page-wrap container">
      <PageHeader eyebrow="Foundation / Reports" title="Transparency is planned into the work.">
        No annual or historical reports have been published yet.
      </PageHeader>
      <article className="prose">
        <p>
          The future reporting model is intended to cover project progress, releases, governance
          changes, contributors, funding and expenses, security events, corrections, and next
          priorities. This page will become an archive when verified reports exist.
        </p>
      </article>
    </main>
  );
}
