import { describe, expect, it } from "vitest";
import { inspectSecurityHeaders } from "../scripts/hosted-security-headers";

function validHeaders() {
  return new Headers({
    "content-security-policy":
      "default-src 'self'; script-src 'self' 'nonce-example'; object-src 'none'; frame-ancestors 'none'",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "referrer-policy": "strict-origin-when-cross-origin",
    "permissions-policy": "camera=(), microphone=(), geolocation=()",
    "strict-transport-security": "max-age=31536000; includeSubDomains; preload",
  });
}

describe("hosted security headers", () => {
  it("accepts the production header contract", () => {
    const result = inspectSecurityHeaders(validHeaders(), true);
    expect(result.issues).toEqual([]);
    expect(result.status.strictTransportSecurity).toBe(true);
  });

  it("requires HSTS for HTTPS but permits its absence for HTTP", () => {
    const headers = validHeaders();
    headers.delete("strict-transport-security");
    expect(inspectSecurityHeaders(headers, true).issues).toContain(
      "strict-transport-security is required for HTTPS staging",
    );
    expect(inspectSecurityHeaders(headers, false).issues).toEqual([]);
  });

  it("rejects unsafe or weakened security policies", () => {
    const headers = validHeaders();
    headers.set(
      "content-security-policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    );
    headers.set("x-frame-options", "SAMEORIGIN");
    const result = inspectSecurityHeaders(headers, true);
    expect(result.status.contentSecurityPolicy).toBe(false);
    expect(result.status.xFrameOptions).toBe(false);
    expect(result.issues).toHaveLength(2);
  });

  it("rejects a disabled or short-lived HSTS policy", () => {
    const headers = validHeaders();
    headers.set("strict-transport-security", "max-age=0");
    const result = inspectSecurityHeaders(headers, true);
    expect(result.status.strictTransportSecurity).toBe(false);
    expect(result.issues).toContain("strict-transport-security is required for HTTPS staging");
  });
});
