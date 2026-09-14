"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main-content" className="page-wrap container">
      <div className="page-header">
        <p className="eyebrow">Temporary error</p>
        <h1>This page could not load.</h1>
        <p>Cached and static public content may remain available. Please try again.</p>
        <div className="actions">
          <button className="button button-dark" onClick={reset}>
            Try again
          </button>
          <Link className="button button-light" href="/foundation/contact">
            Review contact options
          </Link>
        </div>
        <p className="muted">
          If the problem persists, use the available contact options to report it.
        </p>
      </div>
    </main>
  );
}
