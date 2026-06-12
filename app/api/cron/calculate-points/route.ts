// app/api/cron/calculate-points/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/cron-auth";
import prisma from "@/lib/prisma";
import {
  calculatePickScore,
  calculateStreakBonus,
  updateStreak,
} from "@/lib/scoring";
import {
  buildAchievementContext,
  checkAndUnlockAchievements,
} from "@/lib/achievements";

export async function POST(req: NextRequest) {
  const authError = verifyCronSecret(req);
  if (authError) return authError;

  try {
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
        match: { utcDate: "asc" },
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

    const picksByUser = unscoredPicks.reduce<
      Record<string, typeof unscoredPicks>
    >((acc, pick) => {
      if (!acc[pick.userId]) acc[pick.userId] = [];
      acc[pick.userId].push(pick);
      return acc;
    }, {});

    const affectedUserIds = Object.keys(picksByUser);
    const achievementsSummary: Record<string, string[]> = {};

    for (const userId of affectedUserIds) {
      const userPicks = picksByUser[userId];

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { currentStreak: true, maxStreak: true },
      });

      let currentStreak = user?.currentStreak ?? 0;
      let maxStreak = user?.maxStreak ?? 0;
      let totalStreakBonus = 0;

      for (const pick of userPicks) {
        const baseResult = calculatePickScore({
          predictedHome: pick.predictedHomeScore,
          predictedAway: pick.predictedAwayScore,
          actualHome: pick.match.homeScore!,
          actualAway: pick.match.awayScore!,
        });

        currentStreak = updateStreak(currentStreak, baseResult.isCorrectWinner);
        if (currentStreak > maxStreak) maxStreak = currentStreak;

        const streakBonus = baseResult.isCorrectWinner
          ? calculateStreakBonus(currentStreak)
          : 0;

        const totalPoints = baseResult.pointsAwarded + streakBonus;
        totalStreakBonus += streakBonus;

        await prisma.pick.update({
          where: { id: pick.id },
          data: {
            pointsAwarded: totalPoints,
            isExactScore: baseResult.isExactScore,
            isCorrectWinner: baseResult.isCorrectWinner,
            scoredAt: new Date(),
          },
        });
      }

      const aggregate = await prisma.pick.aggregate({
        where: { userId },
        _sum: { pointsAwarded: true },
      });

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

      // ── Achievement check sau khi đã update điểm & streak ──
      const ctx = await buildAchievementContext(userId);
      const newAchievements = await checkAndUnlockAchievements(ctx);
      if (newAchievements.length > 0) {
        achievementsSummary[userId] = newAchievements;
      }
    }

    return NextResponse.json({
      success: true,
      picksScored: unscoredPicks.length,
      usersUpdated: affectedUserIds.length,
      calculatedAt: new Date().toISOString(),
      achievements: achievementsSummary, // bonus info cho log
    });
  } catch (error) {
    console.error("calculate-points failed:", error);
    return NextResponse.json(
      { success: false, error: "Calculation failed" },
      { status: 500 },
    );
  }
}
