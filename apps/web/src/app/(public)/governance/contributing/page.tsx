import Link from "next/link";
import { PageHeader } from "../../../../components/page-primitives";
export default function Contributing() {
  return (
    <main id="main-content" className="page-wrap container">
      <PageHeader eyebrow="Governance" title="Contributing">
        The contribution policy is the current local entrypoint for proposed changes.
      </PageHeader>
      <article className="prose">
        <p>
          Review the{" "}
          <Link href="/governance/policies/contribution-policy">contribution policy</Link> for the
          recorded project practice. Public participation details remain subject to that local
          policy and its review status.
        </p>
      </article>
    </main>
  );
}
