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
    // 1. Tìm TẤT CẢ finished matches mà có ít nhất 1 user liên quan chưa
    //    được "settle" streak cho match đó. Ta dùng mốc: match finished
    //    nhưng chưa có pick nào của batch hiện tại được scoredAt set.
    //
    // Quan trọng: không chỉ lấy match có pick chưa scored — phải lấy
    // TẤT CẢ finished match kể từ lần cron trước, để bắt được cả những
    // user hoàn toàn không pick trận đó (mới gây ra bug đứt streak).
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
            id: true,
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

    // 2. Lấy mốc thời gian: trận finished sớm nhất chưa được xử lý lần này.
    //    Tất cả user active (có >=1 pick từng đặt) cần được kiểm tra streak
    //    cho MỌI finished match kể từ mốc đó — không chỉ user có pick
    //    trong batch.
    const earliestUnprocessed = unscoredPicks[0]?.match.utcDate ?? null;

    if (!earliestUnprocessed) {
      return NextResponse.json({
        success: true,
        message: "No unscored picks found",
        picksScored: 0,
        usersUpdated: 0,
      });
    }

    // Tất cả finished matches từ mốc đó trở đi — dùng chung cho mọi user
    const finishedMatchesSinceCutoff = await prisma.match.findMany({
      where: {
        status: "FINISHED",
        homeScore: { not: null },
        awayScore: { not: null },
        utcDate: { gte: earliestUnprocessed },
      },
      select: { id: true, utcDate: true },
      orderBy: { utcDate: "asc" },
    });

    const finishedMatchIds = finishedMatchesSinceCutoff.map((m) => m.id);

    // 3. FIX BUG CHÍNH: affectedUserIds không chỉ là user có pick trong
    //    batch — phải là TẤT CẢ user đã từng pick ít nhất 1 trận trước đó
    //    (tức là user "active"), vì user bỏ hẳn 1 trận (không pick gì)
    //    vẫn cần bị reset streak, dù họ không xuất hiện trong unscoredPicks.
    const activeUserIds = await prisma.pick.findMany({
      distinct: ["userId"],
      select: { userId: true },
    });

    const picksByUser = unscoredPicks.reduce<
      Record<string, typeof unscoredPicks>
    >((acc, pick) => {
      if (!acc[pick.userId]) acc[pick.userId] = [];
      acc[pick.userId].push(pick);
      return acc;
    }, {});

    const affectedUserIds = activeUserIds.map((u) => u.userId);
    const achievementsSummary: Record<string, string[]> = {};

    for (const userId of affectedUserIds) {
      const userPicks = picksByUser[userId] ?? [];

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { currentStreak: true, maxStreak: true, streakPoints: true },
      });

      let currentStreak = user?.currentStreak ?? 0;
      let maxStreak = user?.maxStreak ?? 0;
      let totalStreakBonus = 0;

      const userPickByMatchId = new Map(userPicks.map((p) => [p.match.id, p]));

      // Duyệt TẤT CẢ finished matches từ cutoff — kể cả khi user này
      // không có pick nào trong toàn bộ batch (sẽ bị reset hết)
      for (const matchInfo of finishedMatchesSinceCutoff) {
        const pick = userPickByMatchId.get(matchInfo.id);

        if (!pick) {
          // User bỏ trận này → streak đứt, vì kickoff chắc chắn đã qua
          // (match đã FINISHED)
          currentStreak = 0;
          continue;
        }

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

      const currentStreakPoints = user?.streakPoints ?? 0;

      await prisma.user.update({
        where: { id: userId },
        data: {
          totalPoints: aggregate._sum.pointsAwarded ?? 0,
          currentStreak,
          maxStreak,
          streakPoints: currentStreakPoints + totalStreakBonus,
        },
      });

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
      achievements: achievementsSummary,
    });
  } catch (error) {
    console.error("calculate-points failed:", error);
    return NextResponse.json(
      { success: false, error: "Calculation failed" },
      { status: 500 },
    );
  }
}
