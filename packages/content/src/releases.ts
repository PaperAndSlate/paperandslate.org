import { projectReleaseSchema, type ProjectRelease } from "./models";
const rawReleases = [
  {
    project: "file-system",
    version: "next",
    status: "unreleased",
    summary: "The current documentation track is under review and has no public software release.",
    canonicalUrl: "/projects/file-system",
  },
  {
    project: "organization-schema",
    version: "0.0.0",
    status: "planned",
    summary: "No released version is recorded for this planned project.",
    canonicalUrl: "/projects/organization-schema",
  },
];
export const releases: ProjectRelease[] = rawReleases.map((release) =>
  projectReleaseSchema.parse(release),
);
export const validatedReleases = releases;
export const getRelease = (project: string) =>
  releases.find((release) => release.project === project);
