export type ParsedHeading = { level: number; text: string };

export type MarkdownLink = {
  image: boolean;
  label: string;
  rawTarget: string;
  start: number;
  end: number;
};

export type MarkdownLinkTarget = {
  destination: string;
  suffix: string;
  title: string;
};

function isWhitespaceCharacter(value: string | undefined): boolean {
  return value !== undefined && value.trim() === "";
}

function trimEndIndex(value: string): number {
  let end = value.length;
  while (end > 0 && isWhitespaceCharacter(value[end - 1])) end -= 1;
  return end;
}

/** Parse one ATX heading line without a backtracking regular expression. */
export function parseHeadingLine(line: string): ParsedHeading | undefined {
  const value = line.endsWith("\r") ? line.slice(0, -1) : line;
  let level = 0;
  while (level < value.length && value[level] === "#") level += 1;
  if (level < 1 || level > 6 || !isWhitespaceCharacter(value[level])) return undefined;

  let contentStart = level;
  while (contentStart < value.length && isWhitespaceCharacter(value[contentStart]))
    contentStart += 1;
  if (contentStart >= value.length) return undefined;
  return { level, text: value.slice(contentStart) };
}

/** Remove the optional ATX closing marker used by heading extraction. */
function stripOptionalClosingMarker(value: string): string {
  let end = trimEndIndex(value);
  if (end > 0 && value[end - 1] === "#") end -= 1;
  return value.slice(0, end).trim();
}

/** Remove a closing marker only when it is separated from heading text by whitespace. */
export function stripClosingHeadingMarker(value: string): string {
  const end = trimEndIndex(value);
  if (end === 0 || value[end - 1] !== "#") return value;
  let markerStart = end - 1;
  while (markerStart > 0 && isWhitespaceCharacter(value[markerStart - 1])) markerStart -= 1;
  return markerStart === end - 1 ? value : value.slice(0, markerStart);
}

export function headings(markdown: string): string[] {
  const result: string[] = [];
  for (const line of markdown.split("\n")) {
    const heading = parseHeadingLine(line);
    if (heading) result.push(stripOptionalClosingMarker(heading.text));
  }
  return result;
}

export function slugifyHeading(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

/**
 * Parse Markdown's simple inline-link form in one forward pass.
 *
 * This intentionally matches the existing ingestion grammar: the first closing
 * bracket and first closing parenthesis terminate a link, and link targets may
 * contain any characters other than a closing parenthesis. More elaborate Markdown
 * constructs are left untouched for the downstream renderer.
 */
export function extractMarkdownLinks(markdown: string): MarkdownLink[] {
  const result: MarkdownLink[] = [];
  let index = 0;
  while (index < markdown.length) {
    const image = markdown[index] === "!" && markdown[index + 1] === "[";
    const openingBracket = image || markdown[index] === "[" ? (image ? index + 1 : index) : -1;
    if (openingBracket < 0) {
      index += 1;
      continue;
    }

    let closingBracket = openingBracket + 1;
    while (closingBracket < markdown.length && markdown[closingBracket] !== "]")
      closingBracket += 1;
    if (closingBracket >= markdown.length) break;
    if (markdown[closingBracket + 1] !== "(") {
      index = closingBracket + 1;
      continue;
    }

    let closingParenthesis = closingBracket + 2;
    while (closingParenthesis < markdown.length && markdown[closingParenthesis] !== ")")
      closingParenthesis += 1;
    if (closingParenthesis >= markdown.length) break;

    result.push({
      image,
      label: markdown.slice(openingBracket + 1, closingBracket),
      rawTarget: markdown.slice(closingBracket + 2, closingParenthesis),
      start: image ? index : openingBracket,
      end: closingParenthesis + 1,
    });
    index = closingParenthesis + 1;
  }
  return result;
}

export function splitMarkdownLinkTarget(rawTarget: string): MarkdownLinkTarget {
  const trimmed = rawTarget.trim();
  if (!trimmed) return { destination: "", suffix: "", title: "" };

  let destinationEnd = 0;
  while (destinationEnd < trimmed.length && !isWhitespaceCharacter(trimmed[destinationEnd]))
    destinationEnd += 1;
  const token = trimmed.slice(0, destinationEnd);
  const queryIndex = token.indexOf("?");
  const anchorIndex = token.indexOf("#");
  const suffixIndex =
    queryIndex < 0 ? anchorIndex : anchorIndex < 0 ? queryIndex : Math.min(queryIndex, anchorIndex);
  if (suffixIndex < 0)
    return { destination: token, suffix: "", title: trimmed.slice(destinationEnd) };
  return {
    destination: token.slice(0, suffixIndex),
    suffix: token.slice(suffixIndex),
    title: trimmed.slice(destinationEnd),
  };
}

export function firstMarkdownLinkDestination(rawTarget: string): string {
  const trimmed = rawTarget.trim();
  let end = 0;
  while (end < trimmed.length && !isWhitespaceCharacter(trimmed[end])) end += 1;
  return trimmed.slice(0, end);
}

export function escapeHtmlAttribute(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("`", "&#96;");
}

export function renderMarkdown(markdown: string): string {
  return markdown
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .split(/\n\s*\n/)
    .map((block) => {
      const heading = parseHeadingLine(block.trim());
      if (heading) {
        const text = stripClosingHeadingMarker(heading.text);
        const id = escapeHtmlAttribute(slugifyHeading(text));
        return `<h${heading.level} id="${id}">${text}</h${heading.level}>`;
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
