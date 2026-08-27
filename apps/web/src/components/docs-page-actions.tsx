"use client";
import { LinkSimple, Printer } from "@phosphor-icons/react";
export function DocsPageActions({ rawRoute }: { rawRoute: string }) {
  return (
    <div className="docs-actions" aria-label="Page actions">
      <a href={rawRoute}>
        <LinkSimple aria-hidden size={15} /> Raw Markdown
      </a>
      <button type="button" onClick={() => window.print()}>
        <Printer aria-hidden size={15} /> Print
      </button>
    </div>
  );
}
