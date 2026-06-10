// lib/pick-distribution.ts
import prisma from "@/lib/prisma";

export interface PickDistribution {
  matchId: string;
  homeCount: number;
  awayCount: number;
  drawCount: number;
  total: number;
}

export async function getPickDistributions(
  matchIds: string[],
): Promise<Map<string, PickDistribution>> {
  if (matchIds.length === 0) return new Map();

  const picks = await prisma.pick.findMany({
    where: { matchId: { in: matchIds } },
    select: {
      matchId: true,
      predictedHomeScore: true,
      predictedAwayScore: true,
    },
  });

  // Group và đếm theo matchId
  const result = new Map<string, PickDistribution>();

  for (const matchId of matchIds) {
    result.set(matchId, {
      matchId,
      homeCount: 0,
      awayCount: 0,
      drawCount: 0,
      total: 0,
    });
  }

  for (const pick of picks) {
    const dist = result.get(pick.matchId);
    if (!dist) continue;

    dist.total++;

    if (pick.predictedHomeScore > pick.predictedAwayScore) {
      dist.homeCount++;
    } else if (pick.predictedAwayScore > pick.predictedHomeScore) {
      dist.awayCount++;
    } else {
      dist.drawCount++;
    }
  }

  return result;
}
