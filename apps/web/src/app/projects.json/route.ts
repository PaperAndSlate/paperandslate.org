import { publicProjects } from "@paper-and-slate/content";
export function GET() {
  return Response.json({
    stability: "local-registry",
    generatedAt: "2026-08-26",
    projects: publicProjects.map(
      ({
        id,
        slug,
        name,
        summary,
        description,
        type,
        status,
        version,
        nextVersion,
        tags,
        visibility,
        lastMeaningfulUpdate,
        docsRoot,
      }) => ({
        id,
        slug,
        name,
        summary,
        description,
        type,
        status,
        version,
        nextVersion,
        tags,
        visibility,
        lastMeaningfulUpdate,
        docsRoot,
      }),
    ),
  });
}
