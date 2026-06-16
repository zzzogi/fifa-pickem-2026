"use client";
// components/picks/day-group.tsx
import { useState } from "react";
import MatchCard from "./match-card";
import type { PickDistribution } from "@/lib/pick-distribution";

interface DayMatch {
  id: string;
  homeTeamName: string | null;
  homeTeamCode: string | null;
  homeTeamCrest: string | null;
  awayTeamName: string | null;
  awayTeamCode: string | null;
  awayTeamCrest: string | null;
  utcDate: Date;
  status: string;
  stage: string | null;
  group: string | null;
  homeScore: number | null;
  awayScore: number | null;
  picks: {
    predictedHomeScore: number;
    predictedAwayScore: number;
    pointsAwarded: number;
    isExactScore: boolean;
    isCorrectWinner: boolean;
  }[];
}

interface DayGroupProps {
  day: string;
  matches: DayMatch[];
  distributions: Map<string, PickDistribution>;
  defaultOpen?: boolean;
}

export default function DayGroup({
  day,
  matches,
  distributions,
  defaultOpen = true,
}: DayGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const liveCount = matches.filter(
    (m) => m.status === "IN_PLAY" || m.status === "PAUSED",
  ).length;

  const finishedCount = matches.filter((m) => m.status === "FINISHED").length;
  const allFinished = finishedCount === matches.length;

  return (
    <section>
      {/* Header — clickable để collapse */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="w-full flex items-center justify-between pb-2 border-b mb-3 group"
        style={{
          borderColor: "var(--outline-variant)",
          background: "transparent",
          cursor: "pointer",
        }}
      >
        <div className="flex items-center gap-2">
          <h3
            className="text-sm uppercase tracking-widest font-bold"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--outline)",
            }}
          >
            {day}
          </h3>

          {/* Live indicator */}
          {liveCount > 0 && (
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
              style={{
                background: "var(--live)",
                color: "white",
                fontFamily: "var(--font-body)",
                animation: "fire-pulse 1.5s ease-in-out infinite",
              }}
            >
              🔴 {liveCount} trực tiếp
            </span>
          )}

          {/* Finished badge */}
          {allFinished && (
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
              style={{
                background: "var(--surface-high)",
                color: "var(--outline)",
                fontFamily: "var(--font-body)",
              }}
            >
              ✓ Đã kết thúc
            </span>
          )}
        </div>

        {/* Chevron */}
        <span
          className="text-xs transition-transform duration-200"
          style={{
            color: "var(--outline)",
            display: "inline-block",
            transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
          }}
        >
          ▼
        </span>
      </button>

      {/* Collapsible content */}
      {isOpen && (
        <div className="grid gap-4 md:grid-cols-2">
          {matches.map((match) => {
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
                distribution={distributions.get(match.id)}
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
      )}
    </section>
  );
}
