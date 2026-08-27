import { Requirement } from "@paper-and-slate/design-system";
import type { ReactNode } from "react";
export function DocsRequirement({ id, children }: { id: string; children: ReactNode }) {
  return <Requirement id={id}>{children}</Requirement>;
}
