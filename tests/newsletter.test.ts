import { describe, expect, it } from "vitest";
import { validateNewsletter } from "../apps/web/src/lib/newsletter";
describe("newsletter safety", () => {
  it("requires valid email, consent and empty honeypot", () => {
    expect(validateNewsletter({ email: "person@example.com", consent: true, website: "" }).ok).toBe(
      true,
    );
    expect(validateNewsletter({ email: "bad", consent: true }).ok).toBe(false);
    expect(validateNewsletter({ email: "person@example.com", consent: false }).ok).toBe(false);
    expect(
      validateNewsletter({ email: "person@example.com", consent: true, website: "bot" }).ok,
    ).toBe(false);
  });
});
