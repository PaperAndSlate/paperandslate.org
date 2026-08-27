import type { ComponentProps } from "react";
import { DocsCallout } from "./src/components/docs-callout";
import { DocsCodeBlock } from "./src/components/docs-code-block";
import { DocsRequirement } from "./src/components/docs-requirement";
import { DocsTabs } from "./src/components/docs-tabs";
import { DocsInteractive } from "./src/components/docs-interactive";

export const mdxComponents = {
  Callout: DocsCallout,
  CodeBlock: DocsCodeBlock,
  Requirement: DocsRequirement,
  Tabs: DocsTabs,
  Interactive: DocsInteractive,
  pre: (props: ComponentProps<"pre">) => <pre className="ds-code" {...props} />,
};

export function useMDXComponents() {
  return mdxComponents;
}

export default mdxComponents;
