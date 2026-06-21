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
    // Picks chưa được scored — đây là việc CẦN làm trong lần chạy này
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

    // CHỈ xử lý user có unscored pick trong lần chạy này — không touch
    // user khác. Mỗi user có cutoff RIÊNG dựa trên lịch sử của chính họ.
    const affectedUserIds = Object.keys(picksByUser);
    const achievementsSummary: Record<string, string[]> = {};

    for (const userId of affectedUserIds) {
      const userPicks = picksByUser[userId];

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { currentStreak: true, maxStreak: true, streakPoints: true },
      });

      let currentStreak = user?.currentStreak ?? 0;
      let maxStreak = user?.maxStreak ?? 0;
      let totalStreakBonus = 0;

      // Mốc riêng của user này: pick ĐÃ scored gần nhất (theo utcDate trận)
      const lastScoredPick = await prisma.pick.findFirst({
        where: { userId, scoredAt: { not: null } },
        select: { match: { select: { utcDate: true } } },
        orderBy: { match: { utcDate: "desc" } },
      });

      // Nếu chưa từng được score, dùng pick đầu tiên của user làm mốc
      // (để tránh quét toàn bộ lịch sử giải đấu không liên quan)
      const firstPick = lastScoredPick
        ? null
        : await prisma.pick.findFirst({
            where: { userId },
            select: { match: { select: { utcDate: true } } },
            orderBy: { match: { utcDate: "asc" } },
          });

      // Nếu user đã từng được score → cutoff là trận ĐÃ XỬ LÝ, nên lấy
      // các trận SAU nó (gt). Nếu user chưa từng được score → cutoff là
      // trận pick ĐẦU TIÊN của họ, nên phải lấy CẢ trận đó (gte), vì nó
      // chưa được tính điểm lần nào.
      const userCutoff = lastScoredPick
        ? lastScoredPick.match.utcDate
        : (firstPick?.match.utcDate ?? null);

      if (!userCutoff) continue; // user chưa từng pick gì — bỏ qua

      // Tất cả finished matches từ mốc riêng của user này — không liên
      // quan đến cutoff của user khác
      const finishedMatchesForUser = await prisma.match.findMany({
        where: {
          status: "FINISHED",
          homeScore: { not: null },
          awayScore: { not: null },
          utcDate: lastScoredPick ? { gt: userCutoff } : { gte: userCutoff },
        },
        select: { id: true, utcDate: true },
        orderBy: { utcDate: "asc" },
      });

      const userPickByMatchId = new Map(userPicks.map((p) => [p.match.id, p]));

      for (const matchInfo of finishedMatchesForUser) {
        const pick = userPickByMatchId.get(matchInfo.id);

        if (!pick) {
          // User bỏ trận này (match đã FINISHED, kickoff chắc chắn đã qua)
          // → streak đứt
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
