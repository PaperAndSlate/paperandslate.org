"use client";

import Link from "next/link";
import type { DocsDocument } from "../../../../packages/docs-ingestion/src/types";
import { BookOpenText } from "@phosphor-icons/react";
import { docProjectRecords } from "../lib/docs";
export function DocsNavigation({ documents }: { documents: DocsDocument[] }) {
  const projects = docProjectRecords();
  const taxonomy = [...new Set(documents.flatMap((doc) => doc.taxonomy ?? []))].sort();
  return (
    <nav aria-label="Documentation taxonomy">
      <p className="eyebrow">Projects</p>
      <ul>
        {projects.map((project) => (
          <li key={project.slug}>
            <Link href={project.root}>
              <BookOpenText aria-hidden size={15} /> {project.title}
            </Link>
          </li>
        ))}
      </ul>
      <p className="eyebrow">Topics</p>
      <ul>
        {taxonomy.map((topic) => (
          <li key={topic}>
            <Link href={`/docs/${topic}`}>{topic}</Link>
          </li>
        ))}
      </ul>
      <p className="eyebrow">Documentation sections</p>
      <ul>
        {[
          ["Getting started", "/docs/getting-started"],
          ["Concepts", "/docs/concepts"],
          ["Guides", "/docs/guides"],
          ["Reference", "/docs/reference"],
          ["Tools", "/docs/tools"],
          ["Governance", "/docs/governance"],
        ].map(([label, href]) => (
          <li key={href}>
            <Link href={href}>{label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
