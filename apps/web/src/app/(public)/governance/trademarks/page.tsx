import Link from "next/link";
import { PageHeader } from "../../../../components/page-primitives";
export default function GovernanceTrademarks() {
  return (
    <main id="main-content" className="page-wrap container">
      <PageHeader eyebrow="Governance" title="Trademarks">
        The current trademark notice is available as a local public page.
      </PageHeader>
      <article className="prose">
        <p>
          Review the <Link href="/trademarks">trademark policy</Link> for the current notice. A
          reviewed policy for broader use remains pending.
        </p>
      </article>
    </main>
  );
}
