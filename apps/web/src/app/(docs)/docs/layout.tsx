import type { ReactNode } from "react";
import { DocsNavigation } from "../../../components/docs-navigation";
import { docs } from "../../../lib/docs";
export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <section className="docs-shell" aria-label="Documentation workspace">
      <aside className="docs-sidebar">
        <div className="docs-brand">
          <span className="eyebrow">Paper &amp; Slate</span>
          <strong>Documentation</strong>
          <span className="muted">Local, reviewed source</span>
        </div>
        <a href="/docs">Overview</a>
        <DocsNavigation documents={docs} />
        <a href="/projects">Projects</a>
        <a href="/foundation/principles">Principles</a>
      </aside>
      <div className="docs-content">{children}</div>
    </section>
  );
}
