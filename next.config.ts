import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN", // blocks your site from being embedded in iframes
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff", // tells browser to trust declared Content-Type, don't guess
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload", // 2 years, HTTPS only
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()", // deny unless explicitly needed
  },
  {
    key: "Content-Security-Policy",
    // Start with a strict policy, loosen only what your app actually needs
    value:
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';",
  },
  {
    key: "x-xss-protection",
    value: "0",
  },
  {
    key: "cross-origin-opener-policy",
    value: "same-origin",
  },
  {
    key: "cross-origin-resource-policy",
    value: "same-origin",
  },
  {
    key: "cross-origin-embedder-policy",
    value: "require-corp",
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "crests.football-data.org",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)", // apply to every route
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
