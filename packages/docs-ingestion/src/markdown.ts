export function headings(markdown: string): string[] {
  return [...markdown.matchAll(/^#{1,6}\s+(.+?)\s*#?$/gm)].map((match) => match[1].trim());
}
export function slugifyHeading(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}
export function renderMarkdown(markdown: string): string {
  return markdown
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .split(/\n\s*\n/)
    .map((block) => {
      const heading = /^(#{1,6})\s+(.+)$/.exec(block.trim());
      if (heading) {
        const level = heading[1].length;
        const text = heading[2].replace(/\s+#$/, "");
        return `<h${level} id="${slugifyHeading(text)}">${text}</h${level}>`;
      }
      if (block.trim().startsWith("- "))
        return `<ul>${block
          .trim()
          .split("\n")
          .map((line) => `<li>${line.slice(2)}</li>`)
          .join("")}</ul>`;
      return `<p>${block.trim().replace(/\n/g, " ")}</p>`;
    })
    .join("\n");
}
