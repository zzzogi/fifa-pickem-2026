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
        // Chỉ apply cho pages, không apply cho file tĩnh
        source:
          "/((?!.*\\.(?:jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|otf)).*)",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "fifa-pickem-2026.vercel.app", // ← tên vercel app của bạn
          },
        ],
        destination: "https://fifapickem2026.com/:path*",
        permanent: true, // 301 redirect
      },
    ];
  },
};

export default nextConfig;
