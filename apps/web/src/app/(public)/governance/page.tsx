import { PageHeader } from "../../../components/page-primitives";
import Link from "next/link";
import { decisions, policies, rfcs } from "@paper-and-slate/content";
export default function Governance() {
  return (
    <main id="main-content" className="page-wrap container">
      <PageHeader eyebrow="Governance" title="Clear decisions for open infrastructure.">
        The current authority is the local maintainer process recorded here. Records show their
        lifecycle, decision maker, and policy metadata.
      </PageHeader>
      <article className="prose">
        <h2>Current state</h2>
        <p>
          <Link href="/governance/charter">Charter</Link>,{" "}
          <Link href="/governance/model">model</Link>, and{" "}
          <Link href="/governance/maintainers">maintainers</Link> describe the current process.
          Browse <Link href="/governance/rfcs">{rfcs.length} RFC</Link>,{" "}
          <Link href="/governance/decisions">{decisions.length} decision</Link>, and{" "}
          <Link href="/governance/policies">{policies.length} policies</Link>.
        </p>
      </article>
    </main>
  );
}
