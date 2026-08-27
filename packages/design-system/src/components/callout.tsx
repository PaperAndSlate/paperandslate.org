import type { ReactNode } from "react";
export function Callout({
  title,
  children,
  tone = "default",
}: {
  title?: string;
  children: ReactNode;
  tone?: "default" | "warning" | "success";
}) {
  return (
    <aside className={`ds-callout ds-callout-${tone}`} role="note">
      {title && <strong>{title}</strong>}
      <div>{children}</div>
    </aside>
  );
}
