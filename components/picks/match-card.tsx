// components/picks/match-card.tsx
import Image from "next/image";
import PickInput from "./pick-input";

interface UserPick {
  predictedHomeScore: number;
  predictedAwayScore: number;
  pointsAwarded: number;
  isExactScore: boolean;
  isCorrectWinner: boolean;
}

interface MatchCardProps {
  matchId: string; // DB id
  homeTeam: string;
  homeTeamCode: string;
  homeTeamCrest?: string;
  awayTeam: string;
  awayTeamCode: string;
  awayTeamCrest?: string;
  kickoffTime: Date;
  status: string;
  stage: string;
  group?: string | null;
  homeScore?: number | null; // actual result
  awayScore?: number | null;
  userPick?: UserPick;
}

function StatusChip({ status }: { status: string }) {
  const config: Record<string, { label: string; bg: string; color: string }> = {
    IN_PLAY: { label: "Live", bg: "var(--live)", color: "white" },
    PAUSED: { label: "HT", bg: "var(--live)", color: "white" },
    FINISHED: { label: "Final", bg: "var(--outline)", color: "white" },
    TIMED: {
      label: "Upcoming",
      bg: "var(--surface-high)",
      color: "var(--outline)",
    },
    SCHEDULED: {
      label: "Upcoming",
      bg: "var(--surface-high)",
      color: "var(--outline)",
    },
  };

  const chip = config[status] ?? config.TIMED;

  return (
    <span
      className="text-xs font-bold uppercase tracking-wide px-2 py-1 rounded-[4px]"
      style={{
        background: chip.bg,
        color: chip.color,
        fontFamily: "var(--font-body)",
      }}
    >
      {chip.label}
    </span>
  );
}

function PointsBadge({ pick }: { pick: UserPick }) {
  if (pick.pointsAwarded === 0 && !pick.isCorrectWinner) return null;

  return (
    <span
      className="text-xs font-bold uppercase tracking-wide px-2 py-1 rounded-[4px]"
      style={{
        background: pick.isExactScore
          ? "var(--success)"
          : "var(--surface-high)",
        color: pick.isExactScore ? "white" : "var(--foreground)",
        fontFamily: "var(--font-body)",
      }}
    >
      {pick.isExactScore ? "⚡ Exact" : "✓ Winner"} +{pick.pointsAwarded}pts
    </span>
  );
}

export default function MatchCard({
  matchId,
  homeTeam,
  homeTeamCode,
  homeTeamCrest,
  awayTeam,
  awayTeamCode,
  awayTeamCrest,
  kickoffTime,
  status,
  stage,
  group,
  homeScore,
  awayScore,
  userPick,
}: MatchCardProps) {
  const kickoffLocal = new Date(kickoffTime).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  });

  const isFinished = status === "FINISHED";
  const isLive = status === "IN_PLAY" || status === "PAUSED";

  return (
    <div
      className="card-sports p-4 transition-shadow hover:shadow-md"
      style={{
        borderColor: isLive ? "var(--live)" : undefined,
        borderWidth: isLive ? "2px" : undefined,
      }}
    >
      {/* Header: status + time + stage */}
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <StatusChip status={status} />
        <span
          className="text-xs text-neutral-500 uppercase tracking-wide"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {group ?? stage} · {kickoffLocal} ICT
        </span>
        {userPick && <PointsBadge pick={userPick} />}
      </div>

      {/* Teams */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        {/* Home team */}
        <div className="flex flex-col items-center gap-2 text-center">
          {homeTeamCrest ? (
            <Image
              src={homeTeamCrest}
              alt={homeTeam}
              width={48}
              height={48}
              className="object-contain"
              loading="lazy"
            />
          ) : (
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold"
              style={{
                background: "var(--surface-muted)",
                fontFamily: "var(--font-display)",
              }}
            >
              {homeTeamCode}
            </div>
          )}
          <span
            className="text-base font-bold leading-tight"
            style={{
              fontFamily: "var(--font-display)",
              letterSpacing: "0.02em",
            }}
          >
            {homeTeamCode || homeTeam}
          </span>
        </div>

        {/* Score / VS */}
        <div className="text-center min-w-[60px]">
          {isFinished || isLive ? (
            <span
              className="text-3xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {homeScore ?? 0} – {awayScore ?? 0}
            </span>
          ) : (
            <span
              className="text-sm uppercase tracking-widest"
              style={{
                color: "var(--outline)",
                fontFamily: "var(--font-body)",
                fontWeight: 700,
              }}
            >
              VS
            </span>
          )}
        </div>

        {/* Away team */}
        <div className="flex flex-col items-center gap-2 text-center">
          {awayTeamCrest ? (
            <Image
              src={awayTeamCrest}
              alt={awayTeam}
              width={48}
              height={48}
              className="object-contain"
              loading="lazy"
            />
          ) : (
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold"
              style={{
                background: "var(--surface-muted)",
                fontFamily: "var(--font-display)",
              }}
            >
              {awayTeamCode}
            </div>
          )}
          <span
            className="text-base font-bold leading-tight"
            style={{
              fontFamily: "var(--font-display)",
              letterSpacing: "0.02em",
            }}
          >
            {awayTeamCode || awayTeam}
          </span>
        </div>
      </div>

      {/* Pick input */}
      <PickInput
        matchId={matchId}
        kickoffTime={kickoffTime}
        initialHome={userPick?.predictedHomeScore}
        initialAway={userPick?.predictedAwayScore}
      />
    </div>
  );
}
