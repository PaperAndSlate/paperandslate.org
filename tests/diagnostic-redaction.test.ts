import { describe, expect, it } from "vitest";
import { redactSensitiveDiagnostics } from "../scripts/diagnostic-redaction";

describe("diagnostic redaction", () => {
  it("redacts assignment, JSON, and bearer-token forms without hiding safe text", () => {
    const output = redactSensitiveDiagnostics(
      '{"apiKey":"api-secret","nested":{"password": "pw-secret"}} Authorization: Bearer bearer-secret mode=healthy',
    );
    expect(output).not.toContain("api-secret");
    expect(output).not.toContain("pw-secret");
    expect(output).not.toContain("bearer-secret");
    expect(output).toContain("mode=healthy");
    expect(output.match(/\[redacted\]/g)).toHaveLength(3);
  });
});
