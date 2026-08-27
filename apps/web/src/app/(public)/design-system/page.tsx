import type { Metadata } from "next";
import {
  Badge,
  Button,
  Callout,
  CodeBlock,
  Requirement,
  Surface,
} from "@paper-and-slate/design-system";
import { PageHeader } from "../../../components/page-primitives";

export const metadata: Metadata = {
  title: "Component library",
  description: "Source-owned Paper & Slate interface components and states.",
  robots: { index: false, follow: false },
};

export default function DesignSystemPage() {
  return (
    <main id="main-content" className="page-wrap container">
      <PageHeader eyebrow="Source-owned interface" title="Component library">
        A review board for the reusable Paper &amp; Slate primitives. This route is intentionally
        noindex and is not part of the public navigation or sitemap.
      </PageHeader>

      <section className="card-grid" aria-label="Component examples">
        <Surface>
          <p className="eyebrow">Actions</p>
          <h2>Buttons</h2>
          <div className="actions">
            <Button type="button">Primary action</Button>
            <button className="button button-light" type="button">
              Quiet action
            </button>
          </div>
        </Surface>
        <Surface>
          <p className="eyebrow">Status</p>
          <h2>Badges</h2>
          <div className="badge-row">
            <Badge>Draft</Badge>
            <Badge tone="success">Supported</Badge>
            <Badge tone="warning">Review pending</Badge>
          </div>
          <p className="muted">
            Status is descriptive; it is not a claim of accreditation or adoption.
          </p>
        </Surface>
        <Surface>
          <p className="eyebrow">Form controls</p>
          <h2>Inputs</h2>
          <label className="ds-field">
            Search example
            <input aria-label="Search example" placeholder="Type a phrase" />
          </label>
          <label className="ds-field">
            Topic
            <select aria-label="Topic example" defaultValue="">
              <option value="">Choose a topic</option>
              <option value="docs">Documentation</option>
              <option value="governance">Governance</option>
            </select>
          </label>
        </Surface>
        <Surface>
          <p className="eyebrow">Feedback</p>
          <h2>Callouts</h2>
          <Callout title="Informational">A compact note for context and provenance.</Callout>
          <Callout title="Review pending" tone="warning">
            This state needs an owner decision before publication.
          </Callout>
          <Callout title="Validated" tone="success">
            Automated checks have recorded a passing result.
          </Callout>
        </Surface>
        <Surface>
          <p className="eyebrow">Content</p>
          <h2>Code and requirements</h2>
          <CodeBlock language="json" code={'{ "status": "review-pending" }'} />
          <Requirement id="WEB-REQ-DEMO">
            Evidence and status stay visible beside the content.
          </Requirement>
        </Surface>
        <Surface>
          <p className="eyebrow">States</p>
          <h2>Empty and error</h2>
          <div className="empty-state">
            <strong>No records in this view.</strong>
            <span className="muted">Try a broader filter or return to the project index.</span>
          </div>
          <Callout title="Temporarily unavailable" tone="warning">
            The static fallback keeps the page readable while a provider is unavailable.
          </Callout>
        </Surface>
      </section>
    </main>
  );
}
