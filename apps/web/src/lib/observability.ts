const sensitive =
  /(?:authorization|cookie|set-cookie|password|token|secret|api[-_]?key|email|body|host)/i;
export function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        sensitive.test(key) ? "[REDACTED]" : redact(item),
      ]),
    );
  return typeof value === "string" && sensitive.test(value) ? "[REDACTED]" : value;
}
export function structuredEvent(event: string, fields: Record<string, unknown> = {}) {
  return { event, fields: redact(fields), mode: "local" as const };
}
