// app/robots.ts
import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://fifapickem2026.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/picks",
        "/profile",
        "/leaderboard",
        "/bracket",
        "/stats",
        "/support",
        "/api/",
        "/_next/image",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
