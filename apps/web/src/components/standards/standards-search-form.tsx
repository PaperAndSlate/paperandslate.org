import type { StandardsQuery } from "../../lib/standards-api";

export function StandardsSearchForm({ values }: { values: StandardsQuery }) {
  return (
    <form
      className="standards-search-form"
      method="get"
      action="/standards/explore"
      aria-label="Search and filter standards"
    >
      <label className="standards-search-primary">
        Search standards, concepts, codes, frameworks, or jurisdictions
        <input
          name="q"
          type="search"
          defaultValue={values.q ?? ""}
          placeholder="e.g. compound interest or 7.EE.B.4"
        />
      </label>
      <label>
        Jurisdiction
        <input
          name="jurisdiction"
          defaultValue={values.jurisdiction ?? ""}
          placeholder="IA, Wales, England"
        />
      </label>
      <label>
        Stage / grade
        <input name="stage" defaultValue={values.stage ?? ""} placeholder="Grade 7, Key Stage 3" />
      </label>
      <label>
        Subject
        <input name="subject" defaultValue={values.subject ?? ""} placeholder="Mathematics" />
      </label>
      <label>
        Release
        <input name="release" defaultValue={values.release ?? ""} placeholder="Candidate release" />
      </label>
      <button className="button button-dark" type="submit">
        Search
      </button>
    </form>
  );
}
