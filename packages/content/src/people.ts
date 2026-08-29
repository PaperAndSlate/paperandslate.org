import { z } from "zod";
const personSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  status: z.enum(["planned", "hidden"]),
  summary: z.string(),
});
export type Person = z.infer<typeof personSchema>;
export const people: Person[] = [
  personSchema.parse({
    id: "maintainers",
    name: "Paper & Slate maintainers",
    role: "Maintainer role",
    status: "planned",
    summary: "The responsible role is recorded without inventing individual public profiles.",
  }),
];

export function publicPeopleAt(records: Person[]) {
  return records.filter((person) => person.status !== "hidden");
}

export const publicPeople = publicPeopleAt(people);
