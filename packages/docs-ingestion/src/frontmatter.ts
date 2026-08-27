import type { Frontmatter } from "./types";
export function parseFrontmatter(input: string): { data: Frontmatter; body: string } {
  if (!input.startsWith("---\n")) return { data: { title: "Untitled" }, body: input };
  const end = input.indexOf("\n---", 4);
  if (end < 0) throw new Error("Unclosed frontmatter");
  const data: Record<string, unknown> = {};
  for (const line of input.slice(4, end).split("\n")) {
    const match = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(line.trim());
    if (!match) throw new Error(`Invalid frontmatter: ${line}`);
    const [, key, raw] = match;
    data[key] =
      raw.startsWith("[") && raw.endsWith("]")
        ? raw
            .slice(1, -1)
            .split(",")
            .map((value) => value.trim().replace(/^['"]|['"]$/g, ""))
            .filter(Boolean)
        : raw === "true"
          ? true
          : raw === "false"
            ? false
            : /^\d+$/.test(raw)
              ? Number(raw)
              : raw.replace(/^['"]|['"]$/g, "");
  }
  if (typeof data.title !== "string" || !data.title.trim())
    throw new Error("Frontmatter title is required");
  return { data: data as Frontmatter, body: input.slice(end + 4).replace(/^\n/, "") };
}
