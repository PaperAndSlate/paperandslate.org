export function CodeBlock({ code, language = "text" }: { code: string; language?: string }) {
  return (
    <pre className="ds-code" data-language={language}>
      <code>{code}</code>
    </pre>
  );
}
