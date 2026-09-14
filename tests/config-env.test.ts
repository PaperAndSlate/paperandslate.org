import { describe, expect, it } from "vitest";
import { parseEnv } from "../packages/config/src/env";

describe("environment contract", () => {
  it("parses the non-secret Standards URL/release and server-only bearer", () => {
    const env = parseEnv({
      STANDARDS_API_URL: "https://standards.example.test",
      STANDARDS_RELEASE_ID: "candidate-release",
      STANDARDS_API_BEARER: "secret-token",
    } as unknown as NodeJS.ProcessEnv);

    expect(env.STANDARDS_API_URL).toBe("https://standards.example.test");
    expect(env.STANDARDS_RELEASE_ID).toBe("candidate-release");
    expect(env.STANDARDS_API_BEARER).toBe("secret-token");
  });

  it("keeps the Standards integration optional and rejects malformed release ids", () => {
    const env = parseEnv({} as unknown as NodeJS.ProcessEnv);
    expect(env.STANDARDS_API_URL).toBeUndefined();
    expect(env.STANDARDS_RELEASE_ID).toBeUndefined();
    expect(env.STANDARDS_API_BEARER).toBeUndefined();
    expect(() =>
      parseEnv({ STANDARDS_RELEASE_ID: "not a release" } as unknown as NodeJS.ProcessEnv),
    ).toThrow();
  });
});
