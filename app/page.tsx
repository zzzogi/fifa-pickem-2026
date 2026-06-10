// app/page.tsx
import { authOptions } from "@/auth";
import HomeHero from "@/components/home/home-hero";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Trang chủ",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "FIFA Pick'em 2026",
    description:
      "Dự đoán tỉ số giải đấu FIFA World Cup 2026, nhận điểm thưởng, giữ chuỗi và tranh đấu trên bảng xếp hạng.",
    url: "/",
    images: ["/og-image.png"],
  },
};

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (session?.user) redirect("/picks");

  return <HomeHero />;
}
