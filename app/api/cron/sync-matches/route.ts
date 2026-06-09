// app/api/cron/sync-matches/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/cron-auth";
import { fetchWorldCupMatches } from "@/lib/football-api";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const authError = verifyCronSecret(req);
  if (authError) return authError;

  try {
    const matches = await fetchWorldCupMatches();

    let upserted = 0;
    let errors = 0;

    for (const match of matches) {
      try {
        // Normalize team data — null nếu chưa biết đội
        const homeTeam = match.homeTeam;
        const awayTeam = match.awayTeam;

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

          homeScore: match.score.fullTime.home,
          awayScore: match.score.fullTime.away,
          winner: match.score.winner,
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
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("sync-matches failed:", error);
    return NextResponse.json(
      { success: false, error: "Sync failed" },
      { status: 500 },
    );
  }
}
