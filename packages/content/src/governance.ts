import { decisionSchema, rfcSchema, type Decision, type Rfc } from "./models";
export const rfcs: Rfc[] = [
  {
    number: 1,
    slug: "stable-identifiers",
    title: "Stable identifiers for public records",
    summary: "A proposal for durable identifiers across local public records.",
    status: "accepted",
    owner: "Paper & Slate maintainers",
    published: "2026-08-18",
    content:
      "This RFC proposes stable, human-readable identifiers for published records. It is an accepted project decision, not a claim of an external standard.",
    canonicalUrl: "/governance/rfcs/1",
  },
];
export const decisions: Decision[] = [
  {
    id: "dec-001",
    title: "Use local registries for this milestone",
    summary: "Publishing data remains build-time and reviewable in the repository.",
    status: "accepted",
    decisionMaker: "Paper & Slate maintainers",
    date: "2026-08-18",
    content:
      "The project will keep content in typed local registries for this milestone. Remote providers and request-time network access remain out of scope.",
    canonicalUrl: "/governance/decisions/dec-001",
  },
];
export const getRfc = (number: number) => rfcs.find((rfc) => rfc.number === number);
export const getDecision = (id: string) => decisions.find((decision) => decision.id === id);
rfcs.forEach((rfc) => rfcSchema.parse(rfc));
decisions.forEach((decision) => decisionSchema.parse(decision));
