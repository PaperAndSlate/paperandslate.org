/** Source-owned metadata for the Paper & Slate visual foundation. */
export const designSystem = {
  name: "Paper & Slate",
  status: "source-owned",
  version: "0.1.0",
  themes: ["light", "dark"],
  typography: {
    display: "Bodoni Moda",
    interface: "Inter",
    code: "IBM Plex Mono",
  },
} as const;

export const semanticTokens = [
  "background",
  "foreground",
  "surface",
  "surface-muted",
  "primary",
  "secondary",
  "accent",
  "border",
  "muted-foreground",
  "focus-ring",
  "success",
  "warning",
  "danger",
  "experimental",
] as const;

export const primitives = [
  "Container",
  "Stack",
  "Cluster",
  "Grid",
  "Divider",
  "VisuallyHidden",
  "SkipLink",
  "AspectRatio",
  "Surface",
] as const;

export * from "./components";
export { cn } from "./lib/utils";
