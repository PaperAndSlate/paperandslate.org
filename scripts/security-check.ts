import fs from "node:fs";
import YAML from "yaml";

const proxyPath = "apps/web/src/proxy.ts";
const proxy = fs.readFileSync(proxyPath, "utf8");
const policy = YAML.parse(fs.readFileSync("config/security-headers.yml", "utf8")) as {
  headers?: Record<string, string>;
};
const headers = policy.headers ?? {};
for (const required of [
  "content-security-policy",
  "x-content-type-options",
  "x-frame-options",
  "referrer-policy",
  "permissions-policy",
  "strict-transport-security",
]) {
  if (!headers[required]) throw new Error(`Security header policy is missing ${required}`);
}
if (
  !proxy.includes("Content-Security-Policy") ||
  !proxy.includes("Strict-Transport-Security") ||
  !proxy.includes("X-Frame-Options")
)
  throw new Error("Runtime security header policy is incomplete");
if (
  proxy.includes("script-src 'self' 'unsafe-inline'") ||
  headers["content-security-policy"].includes("script-src 'self' 'unsafe-inline'")
)
  throw new Error("Production CSP permits unsafe-inline scripts");
if (
  proxy.includes("script-src 'self' 'unsafe-eval'") ||
  headers["content-security-policy"].includes("unsafe-eval")
)
  throw new Error("Production CSP permits unsafe-eval");
if (
  !proxy.includes("requestProtocol: request.nextUrl.protocol") ||
  !proxy.includes("isSecureRequest({")
)
  throw new Error("HSTS must be conditional on direct or configured HTTPS");

console.log("Validated production CSP, conditional HSTS, and security header policy.");
