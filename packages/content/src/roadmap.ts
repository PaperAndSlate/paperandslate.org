import { z } from "zod";
const roadmapItemSchema = z.object({
  id: z.string(),
  horizon: z.enum(["now", "next", "later"]),
  title: z.string(),
  summary: z.string(),
  status: z.literal("planned"),
});
export type RoadmapItem = z.infer<typeof roadmapItemSchema>;
export const roadmap: RoadmapItem[] = [
  roadmapItemSchema.parse({
    id: "public-foundation",
    horizon: "now",
    title: "Public foundation and local registries",
    summary: "Keep the public shell, content records, and publishing checks reviewable.",
    status: "planned",
  }),
  roadmapItemSchema.parse({
    id: "docs-and-specifications",
    horizon: "next",
    title: "Specifications and documentation",
    summary: "Develop reviewed project specifications and documentation sources when ready.",
    status: "planned",
  }),
  roadmapItemSchema.parse({
    id: "community-tooling",
    horizon: "later",
    title: "Community governance and tooling",
    summary: "Consider future participation and tooling after the project scope is established.",
    status: "planned",
  }),
];
