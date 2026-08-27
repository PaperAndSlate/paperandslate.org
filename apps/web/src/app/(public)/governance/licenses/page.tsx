import Link from "next/link";
import { PageHeader } from "../../../../components/page-primitives";
export default function GovernanceLicenses() {
  return (
    <main id="main-content" className="page-wrap container">
      <PageHeader eyebrow="Governance" title="Licenses">
        The current license overview is available as a local public page.
      </PageHeader>
      <article className="prose">
        <p>
          Review the <Link href="/licenses">license overview</Link> and the{" "}
          <Link href="/governance/policies/documentation-license">
            documentation license notice
          </Link>
          . Project-specific assignments remain pending review.
        </p>
      </article>
    </main>
  );
}
