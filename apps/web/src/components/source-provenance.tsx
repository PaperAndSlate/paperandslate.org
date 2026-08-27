import type { DocsDocument } from "../../../../packages/docs-ingestion/src/types";
export function SourceProvenance({ doc }: { doc: DocsDocument }) {
  return (
    <aside className="source-panel" aria-label="Source provenance">
      <strong>Source</strong>
      <p>
        {doc.sourceId} · {doc.sourceMode}
      </p>
      <p>Path: {doc.sourcePath}</p>
      <p>Ref: {doc.ref}</p>
      <p>
        Content hash: <code>{doc.sourceHash}</code>
      </p>
      <p>
        {doc.status === "historical"
          ? "Immutable historical route."
          : "Local review copy; editable source."}
      </p>
    </aside>
  );
}
