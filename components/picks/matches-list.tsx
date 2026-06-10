// components/picks/matches-list.tsx
import { getPickDistributions } from "@/lib/pick-distribution";
import prisma from "@/lib/prisma";
import MatchCard from "./match-card";

interface MatchesListProps {
  userId: string;
}

export default async function MatchesList({ userId }: MatchesListProps) {
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
          Chưa có trận đấu nào sắp tới
        </p>
        <p style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}>
          Các trận đấu sẽ được cập nhật vào thời gian sớm nhất.
        </p>
      </div>
    );
  }

  // Fetch distribution cho tất cả matches 1 lần — tránh N+1 query
  const matchIds = matches.map((m) => m.id);
  const distributions = await getPickDistributions(matchIds); // ← thêm

  // Group theo ngày
  const grouped = matches.reduce<Record<string, typeof matches>>(
    (acc, match) => {
      const day = new Date(match.utcDate).toLocaleDateString("vi-VN", {
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
                  homeTeamCode={match.homeTeamCode}
                  homeTeamCrest={match.homeTeamCrest}
                  awayTeam={match.awayTeamName}
                  awayTeamCode={match.awayTeamCode}
                  awayTeamCrest={match.awayTeamCrest}
                  kickoffTime={match.utcDate}
                  status={match.status}
                  stage={match.stage ?? ""}
                  group={match.group}
                  homeScore={match.homeScore}
                  awayScore={match.awayScore}
                  distribution={distributions.get(match.id)} // ← thêm
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
