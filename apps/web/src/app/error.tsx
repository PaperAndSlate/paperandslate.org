"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main-content" className="page-wrap container">
      <div className="page-header">
        <p className="eyebrow">Temporary error</p>
        <h1>This page could not load.</h1>
        <p>Cached and static public content may remain available. Please try again.</p>
        <button className="button button-dark" onClick={reset}>
          Try again
        </button>
      </div>
    </main>
  );
}
