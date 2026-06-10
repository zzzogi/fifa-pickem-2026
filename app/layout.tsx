// app/layout.tsx
import type { Metadata } from "next";
import { Anton, Archivo_Narrow } from "next/font/google";
import "./globals.css";

// app/layout.tsx — thêm SessionProvider
import AuthProvider from "@/providers/AuthProvider";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://fifa-pickem-2026.vercel.app";

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
    default: "FIFA Pick'em 2026",
    template: "%s | FIFA Pick'em 2026",
  },
  description:
    "Dự đoán tỉ số giải đấu FIFA World Cup 2026, nhận điểm thưởng, giữ chuỗi và tranh đấu trên bảng xếp hạng.",

  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "FIFA Pick'em 2026",
    description:
      "Dự đoán tỉ số giải đấu FIFA World Cup 2026, nhận điểm thưởng, giữ chuỗi và tranh đấu trên bảng xếp hạng.",
    url: "/",
    siteName: "FIFA Pick'em 2026",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "FIFA Pick'em 2026",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FIFA Pick'em 2026",
    description:
      "Dự đoán tỉ số giải đấu FIFA World Cup 2026, nhận điểm thưởng, giữ chuỗi và tranh đấu trên bảng xếp hạng.",
    images: ["/og-image.jpg"],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-title" content="FIFA Pick'em 2026" />
      </head>
      <body className={`${anton.variable} ${archivoNarrow.variable}`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
