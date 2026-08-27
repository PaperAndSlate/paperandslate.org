import type { ReactNode } from "react";
export function Badge({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "success" | "warning";
}) {
  return <span className={`ds-badge ds-badge-${tone}`}>{children}</span>;
}
