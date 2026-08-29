import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { isSecureRequest } from "../apps/web/src/security-transport";

describe("launch hardening", () => {
  it("has safe CSP and manifests", () => {
    const source = fs.readFileSync("apps/web/src/proxy.ts", "utf8");
    expect(source).not.toContain("unsafe-eval");
    expect(fs.existsSync("config/rollback.yml")).toBe(true);
  });

  it("emits HSTS for direct HTTPS requests", () => {
    expect(isSecureRequest({ requestProtocol: "https:" })).toBe(true);
  });

  it("uses the configured HTTPS canonical origin behind TLS termination", () => {
    expect(
      isSecureRequest({
        requestProtocol: "http:",
        nodeEnv: "production",
        deploymentEnv: "ci",
        siteUrl: "https://paper-and-slate-web.dev.tower",
      }),
    ).toBe(false);
    expect(
      isSecureRequest({
        requestProtocol: "http:",
        nodeEnv: "production",
        deploymentEnv: "staging",
        siteUrl: "https://paper-and-slate-web.dev.tower",
      }),
    ).toBe(true);
  });

  it("does not enable HSTS for non-hosted or invalid HTTPS configuration", () => {
    expect(
      isSecureRequest({
        requestProtocol: "http:",
        nodeEnv: "production",
        deploymentEnv: "ci",
        siteUrl: "https://example.test",
      }),
    ).toBe(false);
    expect(
      isSecureRequest({
        requestProtocol: "http:",
        nodeEnv: "production",
        deploymentEnv: "staging",
        siteUrl: "not-a-url",
      }),
    ).toBe(false);
  });
});
