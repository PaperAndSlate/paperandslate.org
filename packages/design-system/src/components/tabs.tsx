import type { ReactNode } from "react";
export function Tabs({ children, label = "Examples" }: { children: ReactNode; label?: string }) {
  return (
    <section className="ds-tabs" aria-label={label}>
      {children}
    </section>
  );
}
