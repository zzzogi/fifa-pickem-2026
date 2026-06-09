// lib/stats.ts
import prisma from "@/lib/prisma";

export interface UserStats {
  totalPicks: number;
  correctPicks: number;
  exactScores: number;
  accuracy: number;
  totalPoints: number;
}

export async function getUserStats(userId: string): Promise<UserStats> {
  const [user, picks] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { totalPoints: true },
    }),
    prisma.pick.findMany({
      where: { userId },
      select: {
        isCorrectWinner: true,
        isExactScore: true,
      },
    }),
  ]);

  const totalPicks = picks.length;
  const correctPicks = picks.filter((p) => p.isCorrectWinner).length;
  const exactScores = picks.filter((p) => p.isExactScore).length;

  // Công thức từ PRD: Accuracy = (Correct Picks / Total Picks) × 100
  const accuracy =
    totalPicks > 0 ? Math.round((correctPicks / totalPicks) * 100) : 0;

  return {
    totalPicks,
    correctPicks,
    exactScores,
    accuracy,
    totalPoints: user?.totalPoints ?? 0,
  };
}
