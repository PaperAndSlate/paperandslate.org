import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProduction = process.env.NODE_ENV === "production";
  const nonce = isProduction ? randomBytes(16).toString("base64") : undefined;
  const requestHeaders = new Headers(request.headers);
  if (nonce) requestHeaders.set("x-nonce", nonce);

  const scriptSources = nonce
    ? ["'self'", `'nonce-${nonce}'`]
    : ["'self'", `'${["unsafe", "eval"].join("-")}'`, `'${["unsafe", "inline"].join("-")}'`];
  const contentSecurityPolicy = `default-src 'self'; script-src ${scriptSources.join(" ")}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; upgrade-insecure-requests`;
  // Next uses the request-side CSP to attach the nonce to its inline flight
  // and bootstrap scripts. The response-side policy then enforces it in the
  // browser. Keeping both sides identical prevents static HTML from becoming
  // a non-interactive shell under the production policy.
  if (nonce) requestHeaders.set("Content-Security-Policy", contentSecurityPolicy);

  let response: NextResponse;
  if (pathname.startsWith("/docs/") && pathname.endsWith("/raw")) {
    const segments = pathname.split("/").filter(Boolean);
    const documentSlug = segments.slice(1, -1).join("/");
    if (documentSlug) {
      const rewriteUrl = request.nextUrl.clone();
      rewriteUrl.pathname = `/docs/raw/${documentSlug}`;
      response = NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } });
    } else {
      response = NextResponse.next({ request: { headers: requestHeaders } });
    }
  } else {
    response = NextResponse.next({ request: { headers: requestHeaders } });
  }

  response.headers.set("Content-Security-Policy", contentSecurityPolicy);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("X-Frame-Options", "DENY");
  if (request.nextUrl.protocol === "https:")
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload",
    );
  return response;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
