export const metadata = { title: "Terms of Use", robots: { index: false, follow: false } };
export default function Terms() {
  return (
    <main id="main-content" className="page-wrap container">
      <div className="page-header">
        <p className="eyebrow">Legal</p>
        <h1>Terms of Use</h1>
        <p>
          These local pages are informational and do not constitute a warranty or a released
          specification.
        </p>
      </div>
      <article className="prose">
        <h2>Using this site</h2>
        <p>
          Respect applicable law, licenses, trademarks, and the rights of contributors. Draft,
          planned, and unreleased material must not be represented as a finished standard.
        </p>
        <h2>Legal review</h2>
        <p>Jurisdiction, warranty, and other final legal terms remain pending review.</p>
      </article>
    </main>
  );
}
