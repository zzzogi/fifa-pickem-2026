//proxy.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { JWT } from "next-auth/jwt";

const isDev = process.env.NODE_ENV === "development";

// Routes Googlebot và khách chưa login cần thấy được — không bị redirect về sign-in
const PUBLIC_PATHS = ["/", "/rules"];

export default withAuth(
  function middleware(
    request: NextRequest & { nextauth: { token: JWT | null } },
  ) {
    const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
    const csp = [
      "default-src 'self'",
      isDev
        ? `script-src 'self' 'nonce-${nonce}' 'unsafe-eval' https://www.googletagmanager.com`
        : `script-src 'self' 'nonce-${nonce}' https://www.googletagmanager.com`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self'",
      "connect-src 'self' https://accounts.google.com https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net",
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
      authorized: ({ req, token }) => {
        // Cho phép Googlebot / khách chưa login xem các trang public
        if (PUBLIC_PATHS.includes(req.nextUrl.pathname)) return true;
        return !!token;
      },
    },
  },
);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|otf|txt|xml)).*)",
  ],
};
