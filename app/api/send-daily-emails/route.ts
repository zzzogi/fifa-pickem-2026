// app/api/cron/send-daily-emails/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/cron-auth";
import prisma from "@/lib/prisma";
import { sendDailySummaryEmail } from "@/lib/email";
import {
  allMatchesFinishedToday,
  buildDailySummaryForUser,
} from "@/lib/daily-summary";
import { getLeaderboard } from "@/lib/leaderboard";

const DAILY_QUOTA = 300;

export async function POST(req: NextRequest) {
  const authError = verifyCronSecret(req);
  if (authError) return authError;

  try {
    // 1. Kiểm tra tất cả trận hôm nay đã kết thúc chưa
    const ready = await allMatchesFinishedToday();
    if (!ready) {
      return NextResponse.json({
        success: true,
        message: "Matches not all finished yet — skipping email send",
        emailsSent: 0,
      });
    }

    // 2. Lấy users đã subscribe và có email
    const users = await prisma.user.findMany({
      where: {
        emailSubscribed: true,
        email: { not: null },
        unsubscribeToken: { not: null },
      },
      select: {
        id: true,
        name: true,
        email: true,
        unsubscribeToken: true,
      },
      // Ưu tiên users có picks — sort sau khi filter
      // Lấy tối đa DAILY_QUOTA để không vượt quota
      take: DAILY_QUOTA,
    });

    if (users.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No subscribed users found",
        emailsSent: 0,
      });
    }

    // 3. Build leaderboard 1 lần, dùng cho tất cả users
    const leaderboard = await getLeaderboard();

    // 4. Ưu tiên users có picks hôm nay — họ nhận được mail có nội dung
    //    Users không có picks hôm nay → skip (không gửi mail trống)
    const today = new Date().toISOString().split("T")[0];
    const usersWithPicksToday = await prisma.user.findMany({
      where: {
        id: { in: users.map((u) => u.id) },
        picks: {
          some: {
            scoredAt: { not: null },
            match: {
              utcDate: {
                gte: new Date(`${today}T00:00:00.000Z`),
                lte: new Date(`${today}T23:59:59.999Z`),
              },
            },
          },
        },
      },
      select: { id: true },
    });

    const userIdsWithPicks = new Set(usersWithPicksToday.map((u) => u.id));
    const eligibleUsers = users.filter((u) => userIdsWithPicks.has(u.id));

    // 5. Gửi mail — có delay nhỏ để tránh rate limit Brevo
    let emailsSent = 0;
    let emailsFailed = 0;
    const skipped: string[] = [];

    for (const user of eligibleUsers) {
      if (emailsSent >= DAILY_QUOTA) break;

      if (!user.email || !user.unsubscribeToken) {
        skipped.push(user.id);
        continue;
      }

      const emailData = await buildDailySummaryForUser(
        user.id,
        user.email,
        user.name ?? "Người chơi",
        user.unsubscribeToken,
        leaderboard,
      );

      if (!emailData) {
        skipped.push(user.id);
        continue;
      }

      const sent = await sendDailySummaryEmail(emailData);
      if (sent) {
        emailsSent++;
      } else {
        emailsFailed++;
      }

      // Delay 100ms giữa mỗi mail để tránh burst rate limit
      if (emailsSent < eligibleUsers.length) {
        await new Promise((r) => setTimeout(r, 100));
      }
    }

    return NextResponse.json({
      success: true,
      emailsSent,
      emailsFailed,
      skipped: skipped.length,
      sentAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("send-daily-emails failed:", error);
    return NextResponse.json(
      { success: false, error: "Email send failed" },
      { status: 500 },
    );
  }
}
