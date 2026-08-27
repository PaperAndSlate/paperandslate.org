import { Tabs } from "@paper-and-slate/design-system";
import type { ReactNode } from "react";
export function DocsTabs({ children }: { children: ReactNode }) {
  return <Tabs>{children}</Tabs>;
}
