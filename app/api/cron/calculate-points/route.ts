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
  buildAchievementContextsBatch,
  checkAndUnlockAchievementsBatch,
} from "@/lib/achievements";

// Vercel Hobby (Fluid Compute): tối đa 300s (5 phút) cho serverless function
export const maxDuration = 300;

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
          select: { id: true, utcDate: true, createdAt: true },
          orderBy: { utcDate: "asc" },
        })
      : [];

    // ── XỬ LÝ TỪNG USER TRONG MEMORY (không query DB thêm) ──

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

      // Sort: utcDate asc, then createdAt asc as tiebreaker for simultaneous matches.
      // Matches the UI display order so scoring and display are always consistent.
      const orderedMatches = [...finishedMatchesForUser].sort((a, b) => {
        const timeDiff = a.utcDate.getTime() - b.utcDate.getTime();
        if (timeDiff !== 0) return timeDiff;
        return a.createdAt.getTime() - b.createdAt.getTime();
      });

      for (const matchInfo of orderedMatches) {
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

        let totalPoints: number;
        let earnedStreakBonus: number;

        if (pick.isStarOfHope) {
          if (baseResult.isCorrectWinner) {
            // Star correct: flat +2 bonus on top of normal points
            totalPoints = baseResult.pointsAwarded + streakBonus + 2;
          } else {
            // Star wrong: lose 2 points
            totalPoints = -2;
          }
          earnedStreakBonus = streakBonus;
        } else {
          totalPoints = baseResult.pointsAwarded + streakBonus;
          earnedStreakBonus = streakBonus;
        }

        totalStreakBonus += earnedStreakBonus;
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

    // ── GHI DB: bulk UPDATE bằng 1 câu SQL duy nhất thay vì N update
    //    tuần tự trong transaction (1466 update tuần tự là nút thắt lớn
    //    nhất gây timeout) ──

    if (pickUpdates.length > 0) {
      // Postgres: UPDATE ... FROM (VALUES ...) — cập nhật hàng nghìn dòng
      // trong 1 round-trip DB duy nhất
      const values = pickUpdates
        .map(
          (u) =>
            `('${u.id}', ${u.pointsAwarded}, ${u.isExactScore}, ${u.isCorrectWinner})`,
        )
        .join(",");

      await prisma.$executeRawUnsafe(`
        UPDATE "Pick" AS p
        SET
          "pointsAwarded" = v.points_awarded,
          "isExactScore" = v.is_exact_score,
          "isCorrectWinner" = v.is_correct_winner,
          "scoredAt" = NOW()
        FROM (VALUES ${values}) AS v(id, points_awarded, is_exact_score, is_correct_winner)
        WHERE p.id = v.id
      `);
    }

    // Tính lại totalPoints THẬT từ DB sau khi update picks — dùng 1 query
    // GROUP BY duy nhất thay vì N query aggregate() song song (N query
    // song song vẫn bị nghẽn ở connection pool limit của Supabase free tier)
    const totalsRows = await prisma.$queryRaw<
      { userId: string; total: bigint | number | null }[]
    >`
      SELECT "userId", SUM("pointsAwarded") as total
      FROM "Pick"
      WHERE "userId" IN (${Prisma.join(affectedUserIds)})
      GROUP BY "userId"
    `;
    const totalPointsMap = new Map(
      totalsRows.map((r) => [r.userId, Number(r.total ?? 0)]),
    );

    if (userUpdates.length > 0) {
      const userValues = userUpdates
        .map(
          (u) =>
            `('${u.id}', ${totalPointsMap.get(u.id) ?? 0}, ${u.currentStreak}, ${u.maxStreak}, ${u.streakPoints})`,
        )
        .join(",");

      await prisma.$executeRawUnsafe(`
        UPDATE "User" AS usr
        SET
          "totalPoints" = v.total_points,
          "currentStreak" = v.current_streak,
          "maxStreak" = v.max_streak,
          "streakPoints" = v.streak_points
        FROM (VALUES ${userValues}) AS v(id, total_points, current_streak, max_streak, streak_points)
        WHERE usr.id = v.id
      `);
    }

    // Achievements — batch hóa: 3 query lớn cho TẤT CẢ user thay vì
    // 3-20 query nhỏ NHÂN với số user (đây chính là nguyên nhân timeout)
    const achievementContexts =
      await buildAchievementContextsBatch(affectedUserIds);
    const achievementsSummary =
      await checkAndUnlockAchievementsBatch(achievementContexts);

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
