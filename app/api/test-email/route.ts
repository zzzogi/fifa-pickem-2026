// app/api/test-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sendDailySummaryEmail } from "@/lib/email";

// Chỉ chạy trong development
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const sent = await sendDailySummaryEmail({
    to: "dieuanh068@gmail.com", // ← đổi thành email của bạn
    userName: "Dieu Anh",
    unsubscribeToken:
      "c28b7ea3d12b7f0971bf825792fafae867bc76b9ed399ad6405f809bd01c2785",

    correctToday: 2,
    wrongToday: 1,
    pointsToday: 8,
    totalPoints: 124,
    rank: 17,

    pointsToTop10: 8,
    overtakenByName: "Minh Tuấn",
    overtakenByPoints: 2,

    nextMatchHome: "Brazil",
    nextMatchAway: "Uruguay",
    nextMatchHoursFromNow: 6,
  });

  return NextResponse.json({ sent });
}
