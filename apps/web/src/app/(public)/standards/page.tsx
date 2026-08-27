import Link from "next/link";
import { PageHeader } from "../../../components/page-primitives";

export const metadata = {
  title: "Standards Explorer — Paper & Slate",
  description:
    "Explore source-backed educational standards with transparent release, provenance, and rights states.",
};

export default function StandardsLanding() {
  return (
    <main id="main-content" className="page-wrap container standards-landing">
      <PageHeader
        eyebrow="Standards / public Explorer"
        title="Open standards. Clearer understanding."
      >
        Explore educational standards and curriculum frameworks in a source-backed, rights-aware
        catalog. Search metadata, inspect provenance, and see exactly what each release permits.
      </PageHeader>
      <section className="standards-landing-grid" aria-label="Standards Explorer entry points">
        <article>
          <p className="eyebrow">Explore</p>
          <h2>Find the right record.</h2>
          <p>
            Search by code, concept, framework, jurisdiction, subject, or stage. Filters stay in the
            URL so a research trail can be shared.
          </p>
          <Link className="button button-dark" href="/standards/explore">
            Explore standards
          </Link>
        </article>
        <article>
          <p className="eyebrow">Compare</p>
          <h2>See structure side by side.</h2>
          <p>
            Compare exact candidate releases by hierarchy, native types, stages, subjects, and
            languages. Concepts and relationships remain explicitly unmapped.
          </p>
          <Link className="button button-dark" href="/standards/compare">
            Compare releases
          </Link>
        </article>
        <article>
          <p className="eyebrow">History</p>
          <h2>Track candidate changes.</h2>
          <p>
            Review release-pinned metadata changes while keeping historical identities and rights
            limits visible.
          </p>
          <Link className="button button-light" href="/standards/changes">
            View changes
          </Link>
        </article>
        <article>
          <p className="eyebrow">Trust and limits</p>
          <h2>Start with the source.</h2>
          <p>
            Each result reports its candidate release, provenance, verification state, and rights
            mode. Metadata-only records remain useful without exposing restricted wording.
          </p>
          <Link className="button button-light" href="/standards/sources">
            Browse sources
          </Link>
        </article>
      </section>
    </main>
  );
}
