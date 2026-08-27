import { CodeBlock } from "@paper-and-slate/design-system";
export function DocsCodeBlock({ code, language }: { code: string; language?: string }) {
  return <CodeBlock code={code} language={language} />;
}
