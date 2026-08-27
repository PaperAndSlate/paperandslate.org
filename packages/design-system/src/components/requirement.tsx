import type { ReactNode } from "react";
export function Requirement({ id, children }: { id: string; children: ReactNode }) {
  return (
    <article className="ds-requirement" id={id}>
      <span className="eyebrow">Requirement {id}</span>
      <div>{children}</div>
    </article>
  );
}
