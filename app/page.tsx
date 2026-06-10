// app/page.tsx
import { authOptions } from "@/auth";
import HomeHero from "@/components/home/home-hero";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "FIFA Pick'em 2026",
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
        width: 1120, // ← phải đúng kích thước thật của file
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

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (session?.user) redirect("/picks");

  return <HomeHero />;
}
