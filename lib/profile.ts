// lib/profile.ts
import prisma from "@/lib/prisma";
import { ACHIEVEMENT_DEFS, type AchievementRarity } from "@/lib/achievements";

export interface ProfileData {
  id: string;
  name: string | null;
  image: string | null;
  totalPoints: number;
  currentStreak: number;
  maxStreak: number;
  streakPoints: number;
  rank: number;
  totalPicks: number;
  correctPicks: number;
  exactScores: number;
  accuracy: number;
  pickRows: ProfilePickRow[];
  achievements: ProfileAchievement[];
}

export interface ProfilePick {
  id: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
  pointsAwarded: number;
  isExactScore: boolean;
  isCorrectWinner: boolean;
  scoredAt: Date | null;
  match: {
    id: string;
    utcDate: Date;
    status: string;
    stage: string | null;
    group: string | null;
    homeTeamName: string | null;
    homeTeamCode: string | null;
    homeTeamCrest: string | null;
    awayTeamName: string | null;
    awayTeamCode: string | null;
    awayTeamCrest: string | null;
    homeScore: number | null;
    awayScore: number | null;
  };
}

// Row hiển thị trong profile — có thể là pick thật hoặc "bỏ trận"
export type ProfilePickRow =
  | { kind: "pick"; pick: ProfilePick }
  | {
      kind: "missed";
      match: ProfilePick["match"];
    };

export interface ProfileAchievement {
  key: string;
  name: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  unlockedAt: Date;
}

export async function getPublicProfile(
  userId: string,
): Promise<ProfileData | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      image: true,
      totalPoints: true,
      currentStreak: true,
      maxStreak: true,
      streakPoints: true,
      picks: {
        include: {
          match: {
            select: {
              id: true,
              utcDate: true,
              status: true,
              stage: true,
              group: true,
              homeTeamName: true,
              homeTeamCode: true,
              homeTeamCrest: true,
              awayTeamName: true,
              awayTeamCode: true,
              awayTeamCrest: true,
              homeScore: true,
              awayScore: true,
            },
          },
        },
        orderBy: { match: { utcDate: "desc" } },
      },
      achievements: {
        include: {
          achievement: {
            select: { key: true, icon: true, rarity: true },
          },
        },
        orderBy: { unlockedAt: "desc" },
      },
    },
  });

  if (!user) return null;

  // Query tất cả FINISHED matches để phát hiện trận user bỏ
  const allFinishedMatches = await prisma.match.findMany({
    where: { status: "FINISHED" },
    select: {
      id: true,
      utcDate: true,
      status: true,
      stage: true,
      group: true,
      homeTeamName: true,
      homeTeamCode: true,
      homeTeamCrest: true,
      awayTeamName: true,
      awayTeamCode: true,
      awayTeamCrest: true,
      homeScore: true,
      awayScore: true,
    },
    orderBy: { utcDate: "desc" },
  });

  const userPickByMatchId = new Map(user.picks.map((p) => [p.match.id, p]));

  // Merge: với mỗi finished match, nếu user có pick → "pick", không có → "missed"
  const pickRows: ProfilePickRow[] = allFinishedMatches.map((match) => {
    const pick = userPickByMatchId.get(match.id);
    if (pick) {
      return { kind: "pick", pick };
    }
    return { kind: "missed", match };
  });

  // Append các picks chưa finished (upcoming/live) — không phải "missed"
  const pendingPicks = user.picks.filter((p) => p.match.status !== "FINISHED");
  const pendingRows: ProfilePickRow[] = pendingPicks.map((pick) => ({
    kind: "pick",
    pick,
  }));

  // pending trước (desc utcDate), finished sau
  const allRows: ProfilePickRow[] = [...pendingRows, ...pickRows];

  const totalPicks = user.picks.length;
  const correctPicks = user.picks.filter((p) => p.isCorrectWinner).length;
  const exactScores = user.picks.filter((p) => p.isExactScore).length;
  const accuracy =
    totalPicks > 0 ? Math.round((correctPicks / totalPicks) * 100) : 0;

  const rank =
    user.totalPoints > 0
      ? (await prisma.user.count({
          where: { totalPoints: { gt: user.totalPoints } },
        })) + 1
      : null;

  const defMap = new Map(ACHIEVEMENT_DEFS.map((d) => [d.key, d]));
  const achievements: ProfileAchievement[] = user.achievements
    .map((ua) => {
      const def = defMap.get(ua.achievement.key);
      if (!def) return null;
      return {
        key: def.key,
        name: def.name,
        description: def.description,
        icon: ua.achievement.icon,
        rarity: ua.achievement.rarity as AchievementRarity,
        unlockedAt: ua.unlockedAt,
      };
    })
    .filter(Boolean) as ProfileAchievement[];

  return {
    id: user.id,
    name: user.name,
    image: user.image,
    totalPoints: user.totalPoints,
    currentStreak: user.currentStreak,
    maxStreak: user.maxStreak,
    streakPoints: user.streakPoints,
    rank: rank ?? 0,
    totalPicks,
    correctPicks,
    exactScores,
    accuracy,
    pickRows: allRows,
    achievements,
  };
}
