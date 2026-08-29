import { projectSchema, type Project } from "./models";

const shared = {
  repository: null,
  maintainers: ["Paper & Slate maintainers"],
  licenses: [],
  licenseReviewStatus: "not-reviewed" as const,
  lastMeaningfulUpdate: "2026-08-20",
  dependencies: [],
  relationships: [],
  rfcNumbers: [1],
  decisionIds: ["dec-001"],
  roadmapIds: ["public-foundation"],
  newsIds: ["news:local-publishing-foundations"],
  links: [],
  provenanceStatus: "review-pending" as const,
};

const rawProjects = [
  {
    ...shared,
    id: "file-system",
    slug: "file-system",
    name: "File System",
    shortName: "File System",
    summary: "A planned foundation for describing education files and their relationships.",
    description:
      "A proposed format for making education files and their relationships easier to describe and exchange.",
    type: "format" as const,
    status: "planned" as const,
    maturity: "planned" as const,
    health: "paused" as const,
    releaseState: "none" as const,
    nextVersion: "Initial proposal",
    docsRoot: "/docs/file-system",
    docsProject: "file-system",
    tags: ["files", "interoperability"],
    featured: true,
    visibility: "public" as const,
    image: "/media/offering-file-system.jpg",
    imageAlt: "Layered paper sheets representing file relationships",
    details: "This project is planned; specifications and implementation are not yet released.",
    overview: [
      "Describe file identity and relationships",
      "Support exchange between education tools",
      "Document constraints before implementation",
    ],
    interoperability: ["Planned compatibility work is not yet specified."],
  },
  {
    ...shared,
    id: "well-known-discovery",
    slug: "well-known-discovery",
    name: ".well-known Discovery",
    summary: "A planned way for education services to make useful capabilities discoverable.",
    description:
      "A proposed discovery convention for education services. Its compatibility and governance remain under research.",
    type: "registry" as const,
    status: "planned" as const,
    maturity: "planned" as const,
    health: "paused" as const,
    releaseState: "none" as const,
    docsRoot: "/docs/well-known-discovery",
    docsProject: "standards-discovery",
    tags: ["discovery", "interoperability"],
    featured: false,
    visibility: "public" as const,
    image: "/media/offering-discovery.jpg",
    imageAlt: "An open notebook and folded paper for service discovery",
    details: "This project is planned and has no released implementation.",
    overview: ["Explore capability discovery", "Record compatibility questions"],
    interoperability: ["Compatibility remains experimental research."],
  },
  {
    ...shared,
    id: "organization-schema",
    slug: "organization-schema",
    name: "Organization Schema",
    summary: "An unreleased shared vocabulary for describing education organizations.",
    description:
      "A proposed schema for representing education organizations and their relationships.",
    type: "schema" as const,
    status: "unreleased" as const,
    maturity: "experimental" as const,
    health: "limited-maintenance" as const,
    releaseState: "none" as const,
    nextVersion: "Research",
    docsRoot: "/docs/organization-schema",
    docsProject: "standards-organization-schema",
    tags: ["schema", "organizations"],
    featured: true,
    visibility: "public" as const,
    image: "/media/offering-schemas.jpg",
    imageAlt: "Annotated cards representing a shared schema",
    details: "This work is unreleased; the public registry records its intent, not adoption.",
    overview: ["Model organization identity", "Make relationships explicit"],
    interoperability: ["No adoption or compatibility claim is made."],
  },
  {
    ...shared,
    id: "curriculum-standards-schema",
    slug: "curriculum-standards-schema",
    name: "Curriculum Standards Schema",
    summary: "A planned structure for making curriculum standards easier to exchange.",
    description: "A planned schema area for curriculum standards exchange.",
    type: "schema" as const,
    status: "planned" as const,
    maturity: "planned" as const,
    health: "paused" as const,
    releaseState: "none" as const,
    docsRoot: "/docs/curriculum-standards-schema",
    docsProject: "standards-curriculum-standards",
    tags: ["schema", "standards"],
    featured: false,
    visibility: "public" as const,
    image: "/media/offering-schemas.jpg",
    imageAlt: "Paper notes arranged as a standards map",
    details: "This project has not reached a public release.",
    overview: ["Study standards metadata", "Document exchange needs"],
    interoperability: ["Future interoperability work is planned."],
  },
  {
    ...shared,
    id: "course-catalog-schema",
    slug: "course-catalog-schema",
    name: "Course and Catalog Schema",
    summary: "A planned vocabulary for course and catalog data.",
    description: "A planned vocabulary area for course and catalog data.",
    type: "schema" as const,
    status: "planned" as const,
    maturity: "planned" as const,
    health: "paused" as const,
    releaseState: "none" as const,
    docsRoot: "/docs/course-catalog-schema",
    docsProject: "standards-course-schema",
    tags: ["schema", "courses"],
    featured: false,
    visibility: "public" as const,
    image: "/media/offering-schemas.jpg",
    imageAlt: "Catalog pages and index cards on a desk",
    details: "This project is planned for future work.",
    overview: ["Describe course identity", "Explore catalog relationships"],
    interoperability: ["No current integration is claimed."],
  },
  {
    ...shared,
    id: "tools-and-libraries",
    slug: "tools-and-libraries",
    name: "Tools and Libraries",
    summary: "A future home for small tools that help teams work with open education formats.",
    description:
      "A future collection of tools and libraries; no package is currently released from this site.",
    type: "tool" as const,
    status: "planned" as const,
    maturity: "planned" as const,
    health: "paused" as const,
    releaseState: "none" as const,
    docsRoot: "/docs/tools-and-libraries",
    docsProject: "standards-tools-and-libraries",
    tags: ["tooling", "libraries"],
    featured: false,
    visibility: "public" as const,
    image: "/media/offering-governance.jpg",
    imageAlt: "A small toolkit beside an open notebook",
    details: "Tooling is planned; no package is currently released from this site.",
    overview: ["Collect future implementation notes", "Keep experiments discoverable"],
    interoperability: ["No package or integration is currently released."],
  },
] satisfies Array<Record<string, unknown>>;

export const projects: Project[] = rawProjects.map((project) => projectSchema.parse(project));
export function publicProjectsAt(records: Project[]) {
  return records.filter((project) => project.visibility === "public");
}
export const publicProjects = publicProjectsAt(projects);

export function getPublicProject(slug: string) {
  return publicProjects.find((project) => project.slug === slug);
}

/**
 * Compatibility alias for the public site-facing project lookup. Consumers
 * that need to inspect every validated record should use `projects` directly.
 */
export const getProject = getPublicProject;

export function filterPublicProjects(filters: {
  q?: string;
  query?: string;
  type?: string;
  status?: string;
  maturity?: string;
  health?: string;
  tag?: string;
}) {
  const query = (filters.query ?? filters.q)?.trim().toLowerCase() ?? "";
  return publicProjects.filter((p) => {
    const haystack = `${p.name} ${p.summary} ${p.description} ${p.tags.join(" ")}`.toLowerCase();
    return (
      (!query || haystack.includes(query)) &&
      (!filters.type || p.type === filters.type) &&
      (!filters.status || p.status === filters.status) &&
      (!filters.maturity || p.maturity === filters.maturity) &&
      (!filters.health || p.health === filters.health) &&
      (!filters.tag || p.tags.includes(filters.tag))
    );
  });
}

/** Compatibility alias retained for existing public registry consumers. */
export const filterProjects = filterPublicProjects;

export function searchContent(query: string) {
  const normalized = query.trim().toLowerCase();
  return normalized
    ? publicProjects.filter((p) => `${p.name} ${p.summary}`.toLowerCase().includes(normalized))
    : [];
}
export const projectStatusLegend = {
  planned: "Direction recorded for future work.",
  experimental: "An early experiment without a stable release.",
  unreleased: "Work exists in review but has no public release.",
  available: "A reviewed public release is available.",
} as const;
export const projectMaturityLegend = {
  planned: "Direction recorded; no implementation is promised.",
  experimental: "Early work is being explored and is not stable.",
  alpha: "An early implementation may change without compatibility guarantees.",
  beta: "A candidate implementation is available for review.",
  stable: "A reviewed public release has a stability commitment.",
  deprecated: "The project is retained for historical context and should not be adopted.",
  archived: "The project is no longer active but remains available as a record.",
} as const;
export const projectHealthLegend = {
  active: "Current work is moving forward.",
  maintained: "The project receives ongoing maintenance.",
  "limited-maintenance": "Maintenance is occasional or constrained.",
  paused: "No current implementation work is promised.",
  unmaintained: "No maintainer activity is currently recorded.",
} as const;
