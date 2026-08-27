import { Callout } from "@paper-and-slate/design-system";
import type { ReactNode } from "react";
export function DocsCallout({
  title,
  children,
  tone,
}: {
  title?: string;
  children: ReactNode;
  tone?: "default" | "warning" | "success";
}) {
  return (
    <Callout title={title} tone={tone}>
      {children}
    </Callout>
  );
}
