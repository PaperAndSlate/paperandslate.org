const sensitiveName =
  "(?:api[_-]?key|token|password|secret|dsn|authorization|cookie|private[_-]?key|credential)";
const sensitiveAssignment = new RegExp(
  `((?:"?${sensitiveName}"?)\\s*(?:=|:)\\s*)(?:"(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*'|Bearer\\s+[^\\s,}\\]"']+|[^\\s,}\\]]+)`,
  "gi",
);
const bearerToken = /\b(Bearer)\s+[^\s,}"']+/gi;

/** Redact common secret-bearing assignments before diagnostics reach a receipt or log. */
export function redactSensitiveDiagnostics(output: string) {
  return output.replace(sensitiveAssignment, "$1[redacted]").replace(bearerToken, "$1 [redacted]");
}
