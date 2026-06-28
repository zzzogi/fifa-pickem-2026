// app/api/cron/sync-matches/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/cron-auth";
import { fetchWorldCupMatches, scoreHome, scoreAway } from "@/lib/football-api";
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

        const score = match.score;
        const duration = score?.duration ?? null;

        // Log unexpected score shapes for finished ET/PSO matches so we can
        // inspect the real payload if the API changes its response structure.
        if (
          match.status === "FINISHED" &&
          (duration === "PENALTY_SHOOTOUT" || duration === "EXTRA_TIME") &&
          (!score?.regularTime || !score?.extraTime)
        ) {
          console.warn(
            `[sync-matches] Match ${match.id} (${duration}): regularTime/extraTime missing or null. Raw score:`,
            JSON.stringify(score),
          );
        }

        // For knockout matches that went to ET or penalties, store the 120-min score
        // (regularTime + extraTime) so pick comparisons work correctly.
        // Only sum if BOTH breakdown fields have non-null values — otherwise fall
        // back to fullTime to avoid silently storing 0+0=0 for an unknown shape.
        let homeScore: number | null = null;
        let awayScore: number | null = null;
        let penaltyHomeScore: number | null = null;
        let penaltyAwayScore: number | null = null;

        if (duration === "PENALTY_SHOOTOUT" || duration === "EXTRA_TIME") {
          // Use scoreHome/scoreAway helpers — handles both "home" and "homeTeam" field names
          const rtHome = scoreHome(score?.regularTime);
          const rtAway = scoreAway(score?.regularTime);
          const etHome = scoreHome(score?.extraTime);
          const etAway = scoreAway(score?.extraTime);

          if (rtHome !== null && etHome !== null) {
            // Both halves of the breakdown are available — sum for 120-min score
            homeScore = rtHome + etHome;
            awayScore = (rtAway ?? 0) + (etAway ?? 0);
          } else {
            // Breakdown unavailable — fall back to fullTime rather than storing 0
            homeScore = scoreHome(score?.fullTime);
            awayScore = scoreAway(score?.fullTime);
          }

          if (duration === "PENALTY_SHOOTOUT") {
            penaltyHomeScore = scoreHome(score?.penalties);
            penaltyAwayScore = scoreAway(score?.penalties);
          }
        } else {
          homeScore = scoreHome(score?.fullTime);
          awayScore = scoreAway(score?.fullTime);
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
          winner: score?.winner ?? null,
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
