// app/api/cron/calculate-points/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/cron-auth";
import prisma from "@/lib/prisma";
import { calculatePickScore } from "@/lib/scoring";

export async function POST(req: NextRequest) {
  const authError = verifyCronSecret(req);
  if (authError) return authError;

  try {
    // Chỉ lấy picks CHƯA tính điểm (scoredAt = null)
    // của các trận đã FINISHED và có score hợp lệ
    const unscoredPicks = await prisma.pick.findMany({
      where: {
        scoredAt: null, // ← chưa tính điểm
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
          },
        },
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

    const affectedUserIds = new Set<string>();

    // Score từng pick
    for (const pick of unscoredPicks) {
      const result = calculatePickScore({
        predictedHome: pick.predictedHomeScore,
        predictedAway: pick.predictedAwayScore,
        actualHome: pick.match.homeScore!,
        actualAway: pick.match.awayScore!,
      });

      await prisma.pick.update({
        where: { id: pick.id },
        data: {
          pointsAwarded: result.pointsAwarded,
          isExactScore: result.isExactScore,
          isCorrectWinner: result.isCorrectWinner,
          scoredAt: new Date(), // ← đánh dấu đã tính
        },
      });

      affectedUserIds.add(pick.userId);
    }

    // Recalculate totalPoints cho users bị ảnh hưởng
    for (const userId of affectedUserIds) {
      const aggregate = await prisma.pick.aggregate({
        where: { userId },
        _sum: { pointsAwarded: true },
      });

      await prisma.user.update({
        where: { id: userId },
        data: {
          totalPoints: aggregate._sum.pointsAwarded ?? 0,
        },
      });
    }

    return NextResponse.json({
      success: true,
      picksScored: unscoredPicks.length,
      usersUpdated: affectedUserIds.size,
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
