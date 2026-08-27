import type { ComponentProps } from "react";
import { DocsCallout } from "./docs-callout";
import { DocsCodeBlock } from "./docs-code-block";
import { DocsRequirement } from "./docs-requirement";
import { DocsTabs } from "./docs-tabs";
export const mdxComponents = {
  Callout: DocsCallout,
  CodeBlock: DocsCodeBlock,
  Requirement: DocsRequirement,
  Tabs: DocsTabs,
  pre: (props: ComponentProps<"pre">) => <pre className="ds-code" {...props} />,
};
