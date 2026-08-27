export function DocsTableOfContents({ headings }: { headings: string[] }) {
  return (
    <aside className="docs-toc" aria-label="On this page">
      <strong>On this page</strong>
      <ul>
        {headings.map((heading) => (
          <li key={heading}>
            <a
              href={`#${heading
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-")}`}
            >
              {heading}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
