import Image from "next/image";
import type { BracketMatch } from "./types";

function TeamRow({
  name,
  code,
  crest,
  score,
  isWinner,
  isTBD,
}: {
  name: string | null;
  code: string | null;
  crest: string | null;
  score: number | null;
  isWinner: boolean;
  isTBD: boolean;
}) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2"
      style={{
        background: isWinner ? "var(--primary-soft)" : "transparent",
        borderRadius: "var(--radius-sm)",
      }}
    >
      {/* Crest */}
      <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
        {crest && !isTBD ? (
          <Image
            src={crest}
            alt={name ?? ""}
            width={24}
            height={24}
            className="object-contain"
          />
        ) : (
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
            style={{
              background: "var(--surface-muted)",
              color: "var(--outline)",
            }}
          >
            {isTBD ? "?" : (code?.charAt(0) ?? "?")}
          </div>
        )}
      </div>

      {/* Name */}
      <span
        className="flex-1 text-sm font-bold truncate"
        style={{
          fontFamily: "var(--font-display)",
          color: isTBD
            ? "var(--outline)"
            : isWinner
              ? "var(--primary)"
              : "var(--foreground)",
          letterSpacing: "0.02em",
        }}
      >
        {isTBD ? "TBD" : (code ?? name ?? "TBD")}
      </span>

      {/* Score */}
      {score !== null && (
        <span
          className="text-sm font-bold tabular-nums w-5 text-right"
          style={{
            fontFamily: "var(--font-display)",
            color: isWinner ? "var(--primary)" : "var(--foreground)",
          }}
        >
          {score}
        </span>
      )}
    </div>
  );
}

export default function BracketMatchCard({ match }: { match: BracketMatch }) {
  const isFinished = match.status === "FINISHED";
  const isLive = match.status === "IN_PLAY" || match.status === "PAUSED";
  const isTBD = !match.homeTeamName || !match.awayTeamName;

  const homeWins = match.winner === "HOME_TEAM";
  const awayWins = match.winner === "AWAY_TEAM";

  const kickoff = new Date(match.utcDate).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  });

  return (
    <div
      className="rounded-[4px] overflow-hidden"
      style={{
        border: isLive
          ? "1.5px solid var(--live)"
          : "1px solid var(--outline-variant)",
        background: "var(--surface)",
        minWidth: "180px",
        width: "180px",
      }}
    >
      {/* Status bar */}
      <div
        className="px-3 py-1 flex items-center justify-between"
        style={{
          background: isLive
            ? "var(--live)"
            : isFinished
              ? "var(--surface-muted)"
              : "var(--surface-soft)",
          borderBottom: "1px solid var(--outline-variant)",
        }}
      >
        <span
          className="text-xs font-bold uppercase tracking-wide"
          style={{
            color: isLive ? "white" : "var(--outline)",
            fontFamily: "var(--font-body)",
          }}
        >
          {isLive ? "🔴 Trực tiếp" : isFinished ? "Kết thúc" : kickoff}
        </span>
      </div>

      {/* Teams */}
      <div className="py-1">
        <TeamRow
          name={match.homeTeamName}
          code={match.homeTeamCode}
          crest={match.homeTeamCrest}
          score={match.homeScore}
          isWinner={homeWins}
          isTBD={!match.homeTeamName}
        />
        <div
          style={{
            height: "1px",
            background: "var(--outline-variant)",
            margin: "0 12px",
          }}
        />
        <TeamRow
          name={match.awayTeamName}
          code={match.awayTeamCode}
          crest={match.awayTeamCrest}
          score={match.awayScore}
          isWinner={awayWins}
          isTBD={!match.awayTeamName}
        />
      </div>
    </div>
  );
}
