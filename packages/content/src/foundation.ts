import { foundationPageSchema, type FoundationPage } from "./models";
export const foundationPages: FoundationPage[] = [
  {
    slug: "mission",
    title: "Mission",
    summary: "Why Paper & Slate exists and the problem it hopes to help solve.",
    status: "available",
  },
  {
    slug: "principles",
    title: "Principles",
    summary: "The principles that guide open, neutral infrastructure work.",
    status: "available",
  },
  {
    slug: "people",
    title: "People and maintainers",
    summary: "Approved roles are recorded while individual profiles remain hidden until consented.",
    status: "available",
  },
  {
    slug: "funding",
    title: "Funding and independence",
    summary: "A clear disclosure of the current local project status.",
    status: "available",
  },
  {
    slug: "roadmap",
    title: "Roadmap",
    summary: "Now, next, and later areas of planned work.",
    status: "available",
  },
  {
    slug: "reports",
    title: "Reports",
    summary: "The intended transparency model before annual reports exist.",
    status: "available",
  },
  {
    slug: "contact",
    title: "Contact",
    summary: "Role-based paths for questions and future participation.",
    status: "available",
  },
];
foundationPages.forEach((page) => foundationPageSchema.parse(page));
