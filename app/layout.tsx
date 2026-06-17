// app/layout.tsx
import type { Metadata } from "next";
import { Anton, Archivo_Narrow } from "next/font/google";
import "./globals.css";

// app/layout.tsx — thêm SessionProvider
import AuthProvider from "@/providers/AuthProvider";
import Analytics from "@/components/analytics";
import { headers } from "next/headers";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://fifapickem2026.com";

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

const archivoNarrow = Archivo_Narrow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "FIFA Pick'em 2026 — Dự đoán World Cup, Leo Bảng Xếp Hạng",
    template: "%s | FIFA Pick'em 2026",
  },
  description:
    "Dự đoán tỉ số giải đấu FIFA World Cup 2026, nhận điểm thưởng, giữ chuỗi và tranh đấu trên bảng xếp hạng.",

  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "FIFA Pick'em 2026 — Dự đoán World Cup, Leo Bảng Xếp Hạng", // 50-60 chars
    description:
      "Dự đoán tỉ số giải đấu FIFA World Cup 2026, nhận điểm thưởng, giữ chuỗi và tranh đấu trên bảng xếp hạng.",
    url: "/",
    siteName: "FIFA Pick'em 2026", // ← thêm cái này, fix "site name missing"
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200, // ← phải đúng kích thước thật của file
        height: 630, // ← phải đúng kích thước thật của file
        alt: "FIFA Pick'em 2026 — Dự đoán World Cup, Leo Bảng Xếp Hạng",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FIFA Pick'em 2026 — Dự đoán World Cup, Leo Bảng Xếp Hạng",
    description:
      "Dự đoán tỉ số giải đấu FIFA World Cup 2026, nhận điểm thưởng, giữ chuỗi và tranh đấu trên bảng xếp hạng.",
    images: ["/og-image.png"],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-title" content="FIFA Pick'em 2026" />
      </head>
      <body className={`${anton.variable} ${archivoNarrow.variable}`}>
        <Analytics nonce={nonce} />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
