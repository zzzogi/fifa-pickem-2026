// lib/picks.ts
import prisma from "@/lib/prisma";

export async function getUserPicks(userId: string) {
  const picks = await prisma.pick.findMany({
    where: { userId },
    select: {
      matchId: true,
      predictedHomeScore: true,
      predictedAwayScore: true,
      pointsAwarded: true,
      isExactScore: true,
      isCorrectWinner: true,
    },
  });

  // Convert sang Map để lookup O(1) trong component
  const pickMap = new Map(picks.map((p) => [p.matchId, p]));
  return pickMap;
}

export async function getUserSummary(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totalPoints: true },
  });

  const picks = await prisma.pick.findMany({
    where: { userId },
    select: {
      pointsAwarded: true,
      isCorrectWinner: true,
      isExactScore: true,
    },
  });

  const totalPicks = picks.length;
  const correctPicks = picks.filter((p) => p.isCorrectWinner).length;
  const exactScores = picks.filter((p) => p.isExactScore).length;
  const accuracy =
    totalPicks > 0 ? Math.round((correctPicks / totalPicks) * 100) : 0;

  // Rank: đếm số user có totalPoints cao hơn
  const rank = user?.totalPoints
    ? (await prisma.user.count({
        where: { totalPoints: { gt: user.totalPoints } },
      })) + 1
    : null;

  return {
    totalPoints: user?.totalPoints ?? 0,
    totalPicks,
    correctPicks,
    exactScores,
    accuracy,
    rank,
  };
}
