export type SecurityHeaderStatus = {
  contentSecurityPolicy: boolean;
  xContentTypeOptions: boolean;
  xFrameOptions: boolean;
  referrerPolicy: boolean;
  permissionsPolicy: boolean;
  strictTransportSecurity: boolean;
};

export type SecurityHeaderInspection = {
  status: SecurityHeaderStatus;
  issues: string[];
};

export function inspectSecurityHeaders(headers: Headers, requireHsts: boolean) {
  const contentSecurityPolicy = headers.get("content-security-policy") ?? "";
  const strictTransportSecurity = headers.get("strict-transport-security") ?? "";
  const hstsMaxAge = strictTransportSecurity.match(/^max-age=(\d+)/i)?.[1];
  const status: SecurityHeaderStatus = {
    contentSecurityPolicy:
      contentSecurityPolicy.includes("default-src 'self'") &&
      contentSecurityPolicy.includes("script-src") &&
      contentSecurityPolicy.includes("object-src 'none'") &&
      contentSecurityPolicy.includes("frame-ancestors 'none'") &&
      !contentSecurityPolicy.includes("unsafe-eval") &&
      !/script-src[^;]*unsafe-inline/.test(contentSecurityPolicy),
    xContentTypeOptions: headers.get("x-content-type-options")?.toLowerCase() === "nosniff",
    xFrameOptions: headers.get("x-frame-options")?.toUpperCase() === "DENY",
    referrerPolicy:
      headers.get("referrer-policy")?.toLowerCase() === "strict-origin-when-cross-origin",
    permissionsPolicy:
      headers.get("permissions-policy")?.includes("camera=()") === true &&
      headers.get("permissions-policy")?.includes("microphone=()") === true &&
      headers.get("permissions-policy")?.includes("geolocation=()") === true,
    strictTransportSecurity:
      hstsMaxAge !== undefined &&
      Number(hstsMaxAge) >= 31_536_000 &&
      /\bincludeSubDomains\b/i.test(strictTransportSecurity) &&
      /\bpreload\b/i.test(strictTransportSecurity),
  };
  const issues: string[] = [];
  if (!status.contentSecurityPolicy) issues.push("content-security-policy is missing or unsafe");
  if (!status.xContentTypeOptions) issues.push("x-content-type-options must be nosniff");
  if (!status.xFrameOptions) issues.push("x-frame-options must be DENY");
  if (!status.referrerPolicy)
    issues.push("referrer-policy must be strict-origin-when-cross-origin");
  if (!status.permissionsPolicy) issues.push("permissions-policy is missing required restrictions");
  if (requireHsts && !status.strictTransportSecurity)
    issues.push("strict-transport-security is required for HTTPS staging");

  return { status, issues } satisfies SecurityHeaderInspection;
}
