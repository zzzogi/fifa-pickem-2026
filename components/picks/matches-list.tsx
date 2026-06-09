// components/picks/matches-list.tsx
import MatchCard from "./match-card";
import prisma from "@/lib/prisma";

interface MatchesListProps {
  userId: string;
}

export default async function MatchesList({ userId }: MatchesListProps) {
  // Fetch matches từ DB (đã được sync bởi cron job)
  const matches = await prisma.match.findMany({
    orderBy: { utcDate: "asc" },
    include: {
      picks: {
        where: { userId },
        take: 1,
      },
    },
  });

  if (matches.length === 0) {
    return (
      <div className="card-sports p-12 text-center">
        <p
          className="text-4xl mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          NO MATCHES YET
        </p>
        <p style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}>
          Match schedule will appear once synced from Football Data API.
        </p>
      </div>
    );
  }

  // Group theo ngày
  const grouped = matches.reduce<Record<string, typeof matches>>(
    (acc, match) => {
      const day = new Date(match.utcDate).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone: "Asia/Ho_Chi_Minh",
      });
      if (!acc[day]) acc[day] = [];
      acc[day].push(match);
      return acc;
    },
    {},
  );

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([day, dayMatches]) => (
        <section key={day}>
          <h3
            className="text-sm uppercase tracking-widest mb-3 pb-2 border-b"
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              color: "var(--outline)",
              borderColor: "var(--outline-variant)",
            }}
          >
            {day}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {dayMatches.map((match) => {
              const pick = match.picks[0];
              return (
                <MatchCard
                  key={match.id}
                  matchId={match.id}
                  homeTeam={match.homeTeamName}
                  homeTeamCode={
                    match.homeTeamCode ??
                    match.homeTeamName.slice(0, 3).toUpperCase()
                  }
                  homeTeamCrest={match.homeTeamCrest ?? undefined}
                  awayTeam={match.awayTeamName}
                  awayTeamCode={
                    match.awayTeamCode ??
                    match.awayTeamName.slice(0, 3).toUpperCase()
                  }
                  awayTeamCrest={match.awayTeamCrest ?? undefined}
                  kickoffTime={match.utcDate}
                  status={match.status}
                  stage={match.stage ?? ""}
                  group={match.group}
                  homeScore={match.homeScore}
                  awayScore={match.awayScore}
                  userPick={
                    pick
                      ? {
                          predictedHomeScore: pick.predictedHomeScore,
                          predictedAwayScore: pick.predictedAwayScore,
                          pointsAwarded: pick.pointsAwarded,
                          isExactScore: pick.isExactScore,
                          isCorrectWinner: pick.isCorrectWinner,
                        }
                      : undefined
                  }
                />
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
