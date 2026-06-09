// lib/leaderboard.ts
import prisma from "@/lib/prisma";

export interface LeaderboardEntry {
  id: string;
  name: string | null;
  image: string | null;
  totalPoints: number;
  correctPicks: number;
  exactScores: number;
  totalPicks: number;
  accuracy: number;
  rank: number;
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      image: true,
      totalPoints: true,
      picks: {
        select: {
          isCorrectWinner: true,
          isExactScore: true,
        },
      },
    },
  });

  // Tính toán stats cho từng user
  const computed = users.map((user) => {
    const totalPicks = user.picks.length;
    const correctPicks = user.picks.filter((p) => p.isCorrectWinner).length;
    const exactScores = user.picks.filter((p) => p.isExactScore).length;
    const accuracy =
      totalPicks > 0 ? Math.round((correctPicks / totalPicks) * 100) : 0;

    return {
      id: user.id,
      name: user.name,
      image: user.image,
      totalPoints: user.totalPoints,
      correctPicks,
      exactScores,
      totalPicks,
      accuracy,
    };
  });

  // Sort theo tiebreaker: Points → Correct Picks → Exact Scores
  computed.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if (b.correctPicks !== a.correctPicks)
      return b.correctPicks - a.correctPicks;
    return b.exactScores - a.exactScores;
  });

  // Gán rank — những user điểm bằng nhau hoàn toàn cùng rank
  let currentRank = 1;
  return computed.map((user, index) => {
    if (
      index > 0 &&
      (user.totalPoints !== computed[index - 1].totalPoints ||
        user.correctPicks !== computed[index - 1].correctPicks ||
        user.exactScores !== computed[index - 1].exactScores)
    ) {
      currentRank = index + 1;
    }

    return { ...user, rank: currentRank };
  });
}
