// app/api/cron/calculate-points/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/cron-auth";
import prisma from "@/lib/prisma";
import {
  calculatePickScore,
  calculateStreakBonus,
  updateStreak,
} from "@/lib/scoring";

export async function POST(req: NextRequest) {
  const authError = verifyCronSecret(req);
  if (authError) return authError;

  try {
    // Lấy picks chưa tính điểm của trận FINISHED
    const unscoredPicks = await prisma.pick.findMany({
      where: {
        scoredAt: null,
        match: {
          status: "FINISHED",
          homeScore: { not: null },
          awayScore: { not: null },
        },
      },
      include: {
        match: {
          select: {
            homeScore: true,
            awayScore: true,
            utcDate: true,
          },
        },
      },
      orderBy: {
        match: { utcDate: "asc" }, // ← quan trọng: sort theo thời gian
      },
    });

    if (unscoredPicks.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No unscored picks found",
        picksScored: 0,
        usersUpdated: 0,
      });
    }

    // Group picks theo userId để tính streak per user
    const picksByUser = unscoredPicks.reduce<
      Record<string, typeof unscoredPicks>
    >((acc, pick) => {
      if (!acc[pick.userId]) acc[pick.userId] = [];
      acc[pick.userId].push(pick);
      return acc;
    }, {});

    const affectedUserIds = Object.keys(picksByUser);

    for (const userId of affectedUserIds) {
      const userPicks = picksByUser[userId];

      // Lấy streak hiện tại của user từ prisma
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { currentStreak: true, maxStreak: true },
      });

      let currentStreak = user?.currentStreak ?? 0;
      let maxStreak = user?.maxStreak ?? 0;
      let totalStreakBonus = 0;

      // Score từng pick theo thứ tự thời gian
      for (const pick of userPicks) {
        const baseResult = calculatePickScore({
          predictedHome: pick.predictedHomeScore,
          predictedAway: pick.predictedAwayScore,
          actualHome: pick.match.homeScore!,
          actualAway: pick.match.awayScore!,
        });

        // Cập nhật streak
        currentStreak = updateStreak(currentStreak, baseResult.isCorrectWinner);
        if (currentStreak > maxStreak) maxStreak = currentStreak;

        // Tính bonus dựa trên streak SAU khi update
        const streakBonus = baseResult.isCorrectWinner
          ? calculateStreakBonus(currentStreak)
          : 0;

        const totalPoints = baseResult.pointsAwarded + streakBonus;
        totalStreakBonus += streakBonus;

        await prisma.pick.update({
          where: { id: pick.id },
          data: {
            pointsAwarded: totalPoints, // base + bonus gộp chung
            isExactScore: baseResult.isExactScore,
            isCorrectWinner: baseResult.isCorrectWinner,
            scoredAt: new Date(),
          },
        });
      }

      // Recalculate totalPoints từ tất cả picks
      const aggregate = await prisma.pick.aggregate({
        where: { userId },
        _sum: { pointsAwarded: true },
      });

      // Cộng thêm streakPoints riêng để track bonus
      const currentStreakPoints =
        (
          await prisma.user.findUnique({
            where: { id: userId },
            select: { streakPoints: true },
          })
        )?.streakPoints ?? 0;

      await prisma.user.update({
        where: { id: userId },
        data: {
          totalPoints: aggregate._sum.pointsAwarded ?? 0,
          currentStreak,
          maxStreak,
          streakPoints: currentStreakPoints + totalStreakBonus,
        },
      });
    }

    return NextResponse.json({
      success: true,
      picksScored: unscoredPicks.length,
      usersUpdated: affectedUserIds.length,
      calculatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("calculate-points failed:", error);
    return NextResponse.json(
      { success: false, error: "Calculation failed" },
      { status: 500 },
    );
  }
}
