// lib/tournament-stats.ts
import prisma from "@/lib/prisma";

export interface TournamentStats {
  // Tổng quan giải đấu
  totalMatches: number;
  finishedMatches: number;
  upcomingMatches: number;
  liveMatches: number;

  // Picks toàn server
  totalPicks: number;
  totalPlayers: number;
  avgPicksPerPlayer: number;

  // Độ chính xác toàn server
  totalCorrect: number;
  totalExact: number;
  serverAccuracy: number; // % correct / total scored picks
  serverExactRate: number; // % exact / total scored picks

  // Trận được pick nhiều nhất
  mostPickedMatches: MostPickedMatch[];

  // Đội được pick thắng nhiều nhất
  mostBackedTeams: MostBackedTeam[];

  // Top scorers
  topScorers: TopScorer[];

  // Highest active streak
  topStreaks: TopStreak[];

  // Goals stats
  totalGoalsScored: number;
  avgGoalsPerMatch: number;
  highestScoringMatch: HighScoringMatch | null;
}

export interface MostPickedMatch {
  matchId: string;
  homeTeamCode: string | null;
  awayTeamCode: string | null;
  homeTeamCrest: string | null;
  awayTeamCrest: string | null;
  totalPicks: number;
  homePickPct: number;
  awayPickPct: number;
  drawPickPct: number;
}

export interface MostBackedTeam {
  teamCode: string | null;
  teamName: string | null;
  teamCrest: string | null;
  backedCount: number; // số picks chọn đội này thắng
}

export interface TopScorer {
  userId: string;
  name: string | null;
  image: string | null;
  totalPoints: number;
  currentStreak: number;
}

export interface TopStreak {
  userId: string;
  name: string | null;
  image: string | null;
  currentStreak: number;
}

export interface HighScoringMatch {
  homeTeamCode: string | null;
  awayTeamCode: string | null;
  homeScore: number;
  awayScore: number;
  totalGoals: number;
}

export async function getTournamentStats(): Promise<TournamentStats> {
  const [
    matchStats,
    pickAggregate,
    playerCount,
    scoredPickStats,
    topScorers,
    topStreaks,
    mostPickedRaw,
    goalStats,
  ] = await Promise.all([
    // Match counts theo status
    prisma.match.groupBy({
      by: ["status"],
      _count: { id: true },
    }),

    // Tổng picks
    prisma.pick.count(),

    // Tổng players có pick
    prisma.user.count({ where: { picks: { some: {} } } }),

    // Correct/exact trên picks đã scored
    prisma.pick.aggregate({
      where: { scoredAt: { not: null } },
      _count: { id: true },
      _sum: { pointsAwarded: true },
    }),

    // Top 3 scorers
    prisma.user.findMany({
      orderBy: { totalPoints: "desc" },
      take: 3,
      select: {
        id: true,
        name: true,
        image: true,
        totalPoints: true,
        currentStreak: true,
      },
    }),

    // Top 3 streaks
    prisma.user.findMany({
      where: { currentStreak: { gt: 0 } },
      orderBy: { currentStreak: "desc" },
      take: 3,
      select: {
        id: true,
        name: true,
        image: true,
        currentStreak: true,
      },
    }),

    // 3 trận có nhiều picks nhất
    prisma.pick.groupBy({
      by: ["matchId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 3,
    }),

    // Goals từ trận đã FINISHED
    prisma.match.findMany({
      where: {
        status: "FINISHED",
        homeScore: { not: null },
        awayScore: { not: null },
      },
      select: {
        homeTeamCode: true,
        awayTeamCode: true,
        homeScore: true,
        awayScore: true,
        homeTeamCrest: true,
        awayTeamCrest: true,
      },
    }),
  ]);

  // --- Match counts ---
  const statusMap = Object.fromEntries(
    matchStats.map((s) => [s.status, s._count.id]),
  );
  const totalMatches = Object.values(statusMap).reduce((a, b) => a + b, 0);
  const finishedMatches = statusMap["FINISHED"] ?? 0;
  const liveMatches = (statusMap["IN_PLAY"] ?? 0) + (statusMap["PAUSED"] ?? 0);
  const upcomingMatches =
    (statusMap["SCHEDULED"] ?? 0) + (statusMap["TIMED"] ?? 0);

  // --- Scored picks accuracy ---
  const scoredCount = scoredPickStats._count.id;
  const [correctPicks, exactPicks] = await Promise.all([
    prisma.pick.count({
      where: { scoredAt: { not: null }, isCorrectWinner: true },
    }),
    prisma.pick.count({
      where: { scoredAt: { not: null }, isExactScore: true },
    }),
  ]);
  const serverAccuracy =
    scoredCount > 0 ? Math.round((correctPicks / scoredCount) * 100) : 0;
  const serverExactRate =
    scoredCount > 0 ? Math.round((exactPicks / scoredCount) * 100) : 0;

  // --- Most picked matches ---
  const mostPickedMatches: MostPickedMatch[] = [];
  if (mostPickedRaw.length > 0) {
    const matchIds = mostPickedRaw.map((r) => r.matchId);
    const matchDetails = await prisma.match.findMany({
      where: { id: { in: matchIds } },
      select: {
        id: true,
        homeTeamCode: true,
        awayTeamCode: true,
        homeTeamCrest: true,
        awayTeamCrest: true,
      },
    });
    const matchMap = Object.fromEntries(matchDetails.map((m) => [m.id, m]));

    for (const raw of mostPickedRaw) {
      const match = matchMap[raw.matchId];
      if (!match) continue;

      const picks = await prisma.pick.findMany({
        where: { matchId: raw.matchId },
        select: { predictedHomeScore: true, predictedAwayScore: true },
      });

      const total = picks.length;
      let homeWin = 0,
        awayWin = 0,
        draw = 0;
      for (const p of picks) {
        if (p.predictedHomeScore > p.predictedAwayScore) homeWin++;
        else if (p.predictedAwayScore > p.predictedHomeScore) awayWin++;
        else draw++;
      }

      mostPickedMatches.push({
        matchId: raw.matchId,
        homeTeamCode: match.homeTeamCode,
        awayTeamCode: match.awayTeamCode,
        homeTeamCrest: match.homeTeamCrest,
        awayTeamCrest: match.awayTeamCrest,
        totalPicks: total,
        homePickPct: total > 0 ? Math.round((homeWin / total) * 100) : 0,
        awayPickPct: total > 0 ? Math.round((awayWin / total) * 100) : 0,
        drawPickPct: total > 0 ? Math.round((draw / total) * 100) : 0,
      });
    }
  }

  // --- Goals stats ---
  let totalGoalsScored = 0;
  let highestScoringMatch: HighScoringMatch | null = null;
  let maxGoals = 0;

  for (const m of goalStats) {
    const goals = (m.homeScore ?? 0) + (m.awayScore ?? 0);
    totalGoalsScored += goals;
    if (goals > maxGoals) {
      maxGoals = goals;
      highestScoringMatch = {
        homeTeamCode: m.homeTeamCode,
        awayTeamCode: m.awayTeamCode,
        homeScore: m.homeScore!,
        awayScore: m.awayScore!,
        totalGoals: goals,
      };
    }
  }
  const avgGoalsPerMatch =
    finishedMatches > 0
      ? Math.round((totalGoalsScored / finishedMatches) * 10) / 10
      : 0;

  return {
    totalMatches,
    finishedMatches,
    upcomingMatches,
    liveMatches,
    totalPicks: pickAggregate,
    totalPlayers: playerCount,
    avgPicksPerPlayer:
      playerCount > 0 ? Math.round(pickAggregate / playerCount) : 0,
    totalCorrect: correctPicks,
    totalExact: exactPicks,
    serverAccuracy,
    serverExactRate,
    mostPickedMatches,
    mostBackedTeams: [],

    // ← map id → userId
    topScorers: topScorers.map((u) => ({
      userId: u.id,
      name: u.name,
      image: u.image,
      totalPoints: u.totalPoints,
      currentStreak: u.currentStreak,
    })),

    // ← map id → userId
    topStreaks: topStreaks.map((u) => ({
      userId: u.id,
      name: u.name,
      image: u.image,
      currentStreak: u.currentStreak,
    })),

    totalGoalsScored,
    avgGoalsPerMatch,
    highestScoringMatch,
  };
}
