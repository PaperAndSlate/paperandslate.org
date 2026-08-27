"use client";
import Link from "next/link";
import type { DocsDocument } from "../../../../packages/docs-ingestion/src/types";
export function DocsProjectSelector({
  documents,
  current,
}: {
  documents: DocsDocument[];
  current?: string;
}) {
  const projects = [...new Set(documents.map((doc) => doc.project))].sort();
  return (
    <nav aria-label="Documentation projects">
      <form method="get" action="/docs">
        <label htmlFor="docs-project">Project</label>
        <select
          id="docs-project"
          name="project"
          defaultValue={current ?? ""}
          onChange={(event) => {
            const value = event.currentTarget.value;
            if (value) window.location.assign(`/docs/${value}`);
          }}
        >
          <option value="">All projects</option>
          {projects.map((project) => (
            <option key={project} value={project}>
              {project}
            </option>
          ))}
        </select>
        <button type="submit">Open</button>
      </form>
      <noscript>
        <ul>
          {projects.map((project) => (
            <li key={project}>
              <Link href={`/docs/${project}`}>{project}</Link>
            </li>
          ))}
        </ul>
      </noscript>
    </nav>
  );
}
