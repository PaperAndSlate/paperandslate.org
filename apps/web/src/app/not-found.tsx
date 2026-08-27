import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main-content" className="page-wrap container">
      <div className="page-header">
        <p className="eyebrow">404</p>
        <h1>That page is not here.</h1>
        <p>The requested public record could not be found or is not published.</p>
      </div>
      <nav aria-label="Recovery">
        <Link href="/projects">Projects</Link> · <Link href="/docs">Documentation</Link> ·{" "}
        <Link href="/governance">Governance</Link> · <Link href="/news">News</Link> ·{" "}
        <Link href="/search">Search</Link>
      </nav>
    </main>
  );
}
