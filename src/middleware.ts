import { authMiddleware } from "@/lib/auth/edge";
import { NextResponse } from "next/server";

const publicPaths = ["/", "/login", "/register", "/privacy", "/terms"];
const isDev = process.env.NODE_ENV === "development";

function buildCspHeader(nonce: string): string {
  const directives = [
    "default-src 'self'",
    isDev
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
      : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    isDev
      ? "style-src 'self' 'unsafe-inline'"
      : `style-src 'self' 'nonce-${nonce}' 'unsafe-inline'`,
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    isDev
      ? "connect-src 'self' https: ws:"
      : "connect-src 'self' https:",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
  ];

  if (!isDev) {
    directives.push("upgrade-insecure-requests");
  }

  return directives.join("; ");
}

function withCsp(response: NextResponse): NextResponse {
  const nonceBytes = new Uint8Array(16);
  crypto.getRandomValues(nonceBytes);
  const nonce = btoa(String.fromCharCode(...nonceBytes));

  response.headers.set("x-nonce", nonce);
  response.headers.set("Content-Security-Policy", buildCspHeader(nonce));
  return response;
}

export default authMiddleware((req) => {
  const { pathname } = req.nextUrl;

  if (publicPaths.some((p) => pathname === p)) {
    return withCsp(NextResponse.next());
  }
  if (pathname.startsWith("/api/auth")) return NextResponse.next();
  if (pathname.startsWith("/invite/")) {
    return withCsp(NextResponse.next());
  }
  if (pathname.startsWith("/_next")) return NextResponse.next();
  if (pathname.includes(".")) return NextResponse.next();

  if (!req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return withCsp(NextResponse.next());
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
