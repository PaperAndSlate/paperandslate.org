import Link from "next/link";
import { PageHeader } from "../../../../components/page-primitives";
export default function GovernanceCodeOfConduct() {
  return (
    <main id="main-content" className="page-wrap container">
      <PageHeader eyebrow="Governance" title="Code of Conduct">
        The current community notice is available as a local public page.
      </PageHeader>
      <article className="prose">
        <p>
          Read the <Link href="/code-of-conduct">Code of Conduct</Link>. A reporting contact and
          enforcement process are pending.
        </p>
      </article>
    </main>
  );
}
