import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith("/docs/") && pathname.endsWith("/raw")) {
    const segments = pathname.split("/").filter(Boolean);
    const documentSlug = segments.slice(1, -1).join("/");
    if (documentSlug) {
      const rewriteUrl = request.nextUrl.clone();
      rewriteUrl.pathname = `/docs/raw/${documentSlug}`;
      return NextResponse.rewrite(rewriteUrl);
    }
  }

  const response = NextResponse.next();
  const scriptSources = ["'self'"];
  if (process.env.NODE_ENV !== "production")
    scriptSources.push(`'${["unsafe", "eval"].join("-")}'`, `'${["unsafe", "inline"].join("-")}'`);
  response.headers.set(
    "Content-Security-Policy",
    `default-src 'self'; script-src ${scriptSources.join(" ")}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; upgrade-insecure-requests`,
  );
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
