// app/api/cron/sync-matches/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/cron-auth";
import { fetchWorldCupMatches } from "@/lib/football-api";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const authError = verifyCronSecret(req);
    if (authError) return authError;

    let matches = [];

    try {
      matches = await fetchWorldCupMatches();
      if (!Array.isArray(matches)) {
        console.error("Invalid matches payload", matches);

        return NextResponse.json({
          success: false,
          error: "Invalid matches payload",
        });
      }
    } catch (e) {
      console.error("Football API failed:", e);

      return NextResponse.json({
        success: false,
        source: "football-api",
        skipped: true,
      });
    }

    let upserted = 0;
    let errors = 0;

    for (const match of matches) {
      try {
        // Normalize team data — null nếu chưa biết đội
        const homeTeam = match.homeTeam;
        const awayTeam = match.awayTeam;

        const duration = match.score?.duration ?? null;
        // For knockout matches that went to ET or penalties, store the 120-min score
        // (regularTime + extraTime) so pick comparisons work correctly.
        // Penalty scores are stored separately.
        let homeScore: number | null = null;
        let awayScore: number | null = null;
        let penaltyHomeScore: number | null = null;
        let penaltyAwayScore: number | null = null;

        if (duration === "PENALTY_SHOOTOUT") {
          homeScore = (match.score.regularTime?.home ?? 0) + (match.score.extraTime?.home ?? 0);
          awayScore = (match.score.regularTime?.away ?? 0) + (match.score.extraTime?.away ?? 0);
          penaltyHomeScore = match.score.penalties?.home ?? null;
          penaltyAwayScore = match.score.penalties?.away ?? null;
        } else if (duration === "EXTRA_TIME") {
          homeScore = (match.score.regularTime?.home ?? 0) + (match.score.extraTime?.home ?? 0);
          awayScore = (match.score.regularTime?.away ?? 0) + (match.score.extraTime?.away ?? 0);
        } else {
          homeScore = match.score.fullTime?.home ?? null;
          awayScore = match.score.fullTime?.away ?? null;
        }

        const matchData = {
          utcDate: new Date(match.utcDate),
          status: match.status,
          matchday: match.matchday,
          stage: match.stage,
          group: match.group,

          homeTeamId: homeTeam?.id ?? null,
          homeTeamName: homeTeam?.name ?? null,
          homeTeamCode: homeTeam?.tla ?? null,
          homeTeamCrest: homeTeam?.crest ?? null,

          awayTeamId: awayTeam?.id ?? null,
          awayTeamName: awayTeam?.name ?? null,
          awayTeamCode: awayTeam?.tla ?? null,
          awayTeamCrest: awayTeam?.crest ?? null,

          homeScore,
          awayScore,
          winner: match.score.winner,
          duration,
          penaltyHomeScore,
          penaltyAwayScore,
          lastUpdated: new Date(match.lastUpdated),
        };

        await prisma.match.upsert({
          where: { footballDataMatchId: match.id },
          create: {
            footballDataMatchId: match.id,
            ...matchData,
          },
          update: {
            // Update cả team data — khi knockout có đội rồi sẽ tự fill
            utcDate: matchData.utcDate,
            status: matchData.status,

            homeTeamId: matchData.homeTeamId,
            homeTeamName: matchData.homeTeamName,
            homeTeamCode: matchData.homeTeamCode,
            homeTeamCrest: matchData.homeTeamCrest,

            awayTeamId: matchData.awayTeamId,
            awayTeamName: matchData.awayTeamName,
            awayTeamCode: matchData.awayTeamCode,
            awayTeamCrest: matchData.awayTeamCrest,

            homeScore: matchData.homeScore,
            awayScore: matchData.awayScore,
            winner: matchData.winner,
            duration: matchData.duration,
            penaltyHomeScore: matchData.penaltyHomeScore,
            penaltyAwayScore: matchData.penaltyAwayScore,
            lastUpdated: matchData.lastUpdated,
          },
        });

        upserted++;
      } catch (e) {
        console.error(`Failed to upsert match ${match.id}:`, e);
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      total: matches.length,
      upserted,
      errors,
      errorRate: `${errors}/${matches.length}`,
      syncedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error("Unexpected cron error:", e);

    return NextResponse.json({
      success: false,
      unexpected: true,
    });
  }
}
