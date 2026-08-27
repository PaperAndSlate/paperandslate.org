import type { ReactNode } from "react";
export function DocsInteractive({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="info-card">
      <summary>{title}</summary>
      <div>{children}</div>
    </details>
  );
}
