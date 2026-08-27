export const metadata = { title: "Privacy", robots: { index: false, follow: false } };
export default function Privacy() {
  return (
    <main id="main-content" className="page-wrap container">
      <div className="page-header">
        <p className="eyebrow">Legal</p>
        <h1>Privacy</h1>
        <p>
          This local milestone does not sell personal data and does not claim a configured analytics
          or newsletter provider.
        </p>
      </div>
      <article className="prose">
        <h2>Data and storage</h2>
        <p>
          Server logs, browser storage, and any future newsletter processing will be documented
          before activation. No request-time remote provider is used by this site milestone.
        </p>
        <h2>Questions</h2>
        <p>A verified privacy contact is pending.</p>
      </article>
    </main>
  );
}
