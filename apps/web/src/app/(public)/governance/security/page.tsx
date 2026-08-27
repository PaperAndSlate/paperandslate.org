import Link from "next/link";
import { PageHeader } from "../../../../components/page-primitives";
export default function GovernanceSecurity() {
  return (
    <main id="main-content" className="page-wrap container">
      <PageHeader eyebrow="Governance" title="Security">
        The current security notice is available as a local public page.
      </PageHeader>
      <article className="prose">
        <p>
          Review the <Link href="/security">security notice</Link>. A verified vulnerability
          reporting contact and response process are pending.
        </p>
      </article>
    </main>
  );
}
