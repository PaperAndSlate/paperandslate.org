"use client";

import Link from "next/link";
import type { DocsDocument } from "../../../../packages/docs-ingestion/src/types";
export function VersionSelector({
  doc,
  documents,
}: {
  doc: DocsDocument;
  documents: DocsDocument[];
}) {
  const versions = documents.filter(
    (candidate) => candidate.project === doc.project && candidate.sourcePath === doc.sourcePath,
  );
  return (
    <nav aria-label="Document versions">
      <form method="get" action={doc.canonicalRoute}>
        <label htmlFor="doc-version">Version</label>
        <select
          id="doc-version"
          name="version"
          defaultValue={doc.canonicalRoute}
          onChange={(event) => {
            window.location.assign(event.currentTarget.value);
          }}
        >
          {versions.map((version) => (
            <option value={version.canonicalRoute} key={version.id}>
              {version.version} ({version.status})
            </option>
          ))}
        </select>
        <button type="submit">Open</button>
      </form>
      <noscript>
        <ul>
          {versions.map((version) => (
            <li key={version.id}>
              <Link href={version.canonicalRoute}>{version.version}</Link>
            </li>
          ))}
        </ul>
      </noscript>
      <span className="muted">
        {" "}
        <Link href={doc.canonicalRoute}>Permalink</Link>
      </span>
    </nav>
  );
}
