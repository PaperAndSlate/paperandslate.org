"use client";
import Link from "next/link";
import { docProjectRecords } from "../lib/docs";
export function DocsProjectSelector({ current }: { current?: string }) {
  const projects = docProjectRecords();
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
            <option key={project.slug} value={project.slug}>
              {project.title}
            </option>
          ))}
        </select>
        <button type="submit">Open</button>
      </form>
      <noscript>
        <ul>
          {projects.map((project) => (
            <li key={project.slug}>
              <Link href={project.root}>{project.title}</Link>
            </li>
          ))}
        </ul>
      </noscript>
    </nav>
  );
}
