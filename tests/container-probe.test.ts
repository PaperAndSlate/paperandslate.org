import { describe, expect, it } from "vitest";
import { healthProbeCommand } from "../scripts/container-probe";

describe("healthProbeCommand", () => {
  it("uses curl flags when curl is available", () => {
    expect(healthProbeCommand("/usr/bin/curl")).toBe(
      "/usr/bin/curl -fsS --max-time 2 http://127.0.0.1:3000/health",
    );
  });

  it("uses wget flags when curl is unavailable", () => {
    expect(healthProbeCommand("/bin/wget")).toBe(
      "/bin/wget -qO- --timeout=2 http://127.0.0.1:3000/health",
    );
  });

  it("can target the application through a container-DNS alias", () => {
    expect(
      healthProbeCommand("/usr/bin/curl", "http://paper-and-slate-web-check:3000/health"),
    ).toBe("/usr/bin/curl -fsS --max-time 2 http://paper-and-slate-web-check:3000/health");
  });

  it("rejects a non-health target", () => {
    expect(() => healthProbeCommand("/usr/bin/curl", "http://example.test/secret")).toThrow(
      "Unexpected container health URL",
    );
  });

  it("rejects an unexpected client path", () => {
    expect(() => healthProbeCommand("sh -c whoami")).toThrow("Unexpected");
  });
});
