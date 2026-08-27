export const metadata = {
  title: "Accessibility statement",
  robots: { index: false, follow: false },
};
export default function AccessibilityPage() {
  return (
    <main id="main-content" className="page-wrap container">
      <div className="page-header">
        <p className="eyebrow">Accessibility</p>
        <h1>Accessibility statement</h1>
      </div>
      <div className="prose">
        <p>
          Paper &amp; Slate is committed to making this local public site usable with keyboards,
          screen readers, zoom, and reduced-motion preferences.
        </p>
        <h2>Current status</h2>
        <p>
          This statement describes the implemented local experience. Formal conformance review,
          institutional approval, and a supported contact process remain pending.
        </p>
        <h2>Feedback</h2>
        <p>
          Before launch, the maintainers must publish a verified accessibility contact and review
          the site with disabled users and assistive technologies.
        </p>
      </div>
    </main>
  );
}
