// app/api/cron/calculate-points/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/cron-auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import {
  calculatePickScore,
  calculateStreakBonus,
  updateStreak,
} from "@/lib/scoring";
import {
  buildAchievementContext,
  checkAndUnlockAchievements,
} from "@/lib/achievements";

// Vercel Hobby: tối đa 60s cho serverless function
export const maxDuration = 60;

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

    const affectedUserIds = Object.keys(picksByUser);

    // ── PREFETCH BATCH: thay vì N query riêng cho từng user, lấy 1 lần ──

    // 1. Tất cả user info cần (currentStreak, maxStreak, streakPoints)
    const users = await prisma.user.findMany({
      where: { id: { in: affectedUserIds } },
      select: {
        id: true,
        currentStreak: true,
        maxStreak: true,
        streakPoints: true,
      },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    // 2. Pick đã-scored gần nhất của MỖI user (1 query thay vì N)
    //    Dùng raw query để lấy "latest scored pick per user" hiệu quả
    const lastScoredRows = await prisma.$queryRaw<
      { userId: string; utcDate: Date }[]
    >`
      SELECT p."userId", MAX(m."utcDate") as "utcDate"
      FROM "Pick" p
      JOIN "Match" m ON m.id = p."matchId"
      WHERE p."userId" IN (${Prisma.join(affectedUserIds)})
        AND p."scoredAt" IS NOT NULL
      GROUP BY p."userId"
    `;
    const lastScoredMap = new Map(
      lastScoredRows.map((r) => [r.userId, r.utcDate]),
    );

    // 3. Pick ĐẦU TIÊN của mỗi user (cho user chưa từng được score) — 1 query
    const firstPickRows = await prisma.$queryRaw<
      { userId: string; utcDate: Date }[]
    >`
      SELECT p."userId", MIN(m."utcDate") as "utcDate"
      FROM "Pick" p
      JOIN "Match" m ON m.id = p."matchId"
      WHERE p."userId" IN (${Prisma.join(affectedUserIds)})
      GROUP BY p."userId"
    `;
    const firstPickMap = new Map(
      firstPickRows.map((r) => [r.userId, r.utcDate]),
    );

    // 4. Toàn bộ finished matches từ mốc SỚM NHẤT cần — 1 query duy nhất,
    //    rồi filter theo cutoff riêng của từng user trong memory (rẻ hơn
    //    nhiều so với N query DB)
    const earliestPossibleCutoff = [
      ...lastScoredRows.map((r) => r.utcDate),
      ...firstPickRows.map((r) => r.utcDate),
    ].sort((a, b) => a.getTime() - b.getTime())[0];

    const allFinishedMatches = earliestPossibleCutoff
      ? await prisma.match.findMany({
          where: {
            status: "FINISHED",
            homeScore: { not: null },
            awayScore: { not: null },
            utcDate: { gte: earliestPossibleCutoff },
          },
          select: { id: true, utcDate: true },
          orderBy: { utcDate: "asc" },
        })
      : [];

    // ── XỬ LÝ TỪNG USER TRONG MEMORY (không query DB thêm) ──

    const achievementsSummary: Record<string, string[]> = {};
    const pickUpdates: {
      id: string;
      pointsAwarded: number;
      isExactScore: boolean;
      isCorrectWinner: boolean;
    }[] = [];
    const userUpdates: {
      id: string;
      totalPoints: number;
      currentStreak: number;
      maxStreak: number;
      streakPoints: number;
    }[] = [];

    for (const userId of affectedUserIds) {
      const userPicks = picksByUser[userId];
      const user = userMap.get(userId);

      let currentStreak = user?.currentStreak ?? 0;
      let maxStreak = user?.maxStreak ?? 0;
      let totalStreakBonus = 0;

      const lastScored = lastScoredMap.get(userId) ?? null;
      const firstPick = firstPickMap.get(userId) ?? null;
      const userCutoff = lastScored ?? firstPick;

      if (!userCutoff) continue;

      const finishedMatchesForUser = allFinishedMatches.filter((m) =>
        lastScored
          ? m.utcDate.getTime() > userCutoff.getTime()
          : m.utcDate.getTime() >= userCutoff.getTime(),
      );

      const userPickByMatchId = new Map(userPicks.map((p) => [p.match.id, p]));
      let pointsDelta = 0;

      for (const matchInfo of finishedMatchesForUser) {
        const pick = userPickByMatchId.get(matchInfo.id);

        if (!pick) {
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
        pointsDelta += totalPoints;

        pickUpdates.push({
          id: pick.id,
          pointsAwarded: totalPoints,
          isExactScore: baseResult.isExactScore,
          isCorrectWinner: baseResult.isCorrectWinner,
        });
      }

      userUpdates.push({
        id: userId,
        totalPoints: pointsDelta, // cộng dồn sau, xem bên dưới
        currentStreak,
        maxStreak,
        streakPoints: (user?.streakPoints ?? 0) + totalStreakBonus,
      });
    }

    // ── GHI DB: batch transaction thay vì update tuần tự từng cái ──

    // Pick updates — chạy song song trong 1 transaction
    await prisma.$transaction(
      pickUpdates.map((u) =>
        prisma.pick.update({
          where: { id: u.id },
          data: {
            pointsAwarded: u.pointsAwarded,
            isExactScore: u.isExactScore,
            isCorrectWinner: u.isCorrectWinner,
            scoredAt: new Date(),
          },
        }),
      ),
    );

    // Tính lại totalPoints THẬT từ DB (sau khi đã update picks ở trên)
    // — vẫn cần 1 query aggregate per user, nhưng chạy song song
    const aggregates = await Promise.all(
      affectedUserIds.map((userId) =>
        prisma.pick
          .aggregate({
            where: { userId },
            _sum: { pointsAwarded: true },
          })
          .then((agg) => ({ userId, total: agg._sum.pointsAwarded ?? 0 })),
      ),
    );
    const totalPointsMap = new Map(aggregates.map((a) => [a.userId, a.total]));

    await prisma.$transaction(
      userUpdates.map((u) =>
        prisma.user.update({
          where: { id: u.id },
          data: {
            totalPoints: totalPointsMap.get(u.id) ?? 0,
            currentStreak: u.currentStreak,
            maxStreak: u.maxStreak,
            streakPoints: u.streakPoints,
          },
        }),
      ),
    );

    // Achievements — vẫn cần xử lý per-user (logic phức tạp, giữ tuần tự
    // nhưng chạy SAU khi điểm đã chốt nên không bị lệch dữ liệu)
    for (const userId of affectedUserIds) {
      const ctx = await buildAchievementContext(userId);
      const newAchievements = await checkAndUnlockAchievements(ctx);
      if (newAchievements.length > 0) {
        achievementsSummary[userId] = newAchievements;
      }
    }

    return NextResponse.json({
      success: true,
      picksScored: pickUpdates.length,
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
