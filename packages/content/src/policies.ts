import { policySchema, type Policy } from "./models";
export const policies: Policy[] = [
  {
    slug: "contribution-policy",
    title: "Contribution policy",
    summary: "How proposed changes are reviewed in this public project.",
    version: "0.1",
    effectiveDate: "2026-08-18",
    status: "current",
    owner: "Paper & Slate maintainers",
    lastReviewed: "2026-08-18",
    revisionHistory: [],
    kind: "policy",
    canonicalUrl: "/governance/policies/contribution-policy",
    content:
      "Contributions are reviewed in the open repository process. This page describes project practice for this milestone and is not legal advice.",
  },
  {
    slug: "documentation-license",
    title: "Documentation license",
    summary: "The license notice for published documentation.",
    version: "0.1",
    effectiveDate: "2026-08-18",
    status: "current",
    owner: "Paper & Slate maintainers",
    lastReviewed: "2026-08-18",
    revisionHistory: [],
    kind: "license",
    canonicalUrl: "/governance/policies/documentation-license",
    content:
      "Published documentation is provided under the terms stated in the repository license files. Review the repository notices for the authoritative text.",
  },
];
export const getPolicy = (slug: string) =>
  policies.find((policy) => policy.slug === slug && policy.status === "current");
policies.forEach((policy) => policySchema.parse(policy));
