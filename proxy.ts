import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { JWT } from "next-auth/jwt";

export default withAuth(
  function middleware(
    request: NextRequest & { nextauth: { token: JWT | null } },
  ) {
    // CSP nonce logic
    const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
    const csp = [
      "default-src 'self'",
      `script-src 'self' 'nonce-${nonce}'`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self'",
      "connect-src 'self' https://accounts.google.com",
      "frame-ancestors 'none'",
    ].join("; ");

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-nonce", nonce);
    requestHeaders.set("Content-Security-Policy", csp);

    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });
    response.headers.set("Content-Security-Policy", csp);
    return response;
  },
  {
    pages: {
      signIn: "/",
    },
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|otf|txt|xml)).*)",
  ],
};
