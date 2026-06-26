// components/picks/match-card.tsx
import Image from "next/image";
import PickInput from "./pick-input";
import PickDistributionBar from "./pick-distribution-bar";
import { getCountryName } from "@/lib/team-names";
import type { PickDistribution } from "@/lib/pick-distribution";

interface UserPick {
  predictedHomeScore: number;
  predictedAwayScore: number;
  pointsAwarded: number;
  isExactScore: boolean;
  isCorrectWinner: boolean;
  isStarOfHope: boolean;
}

interface MatchCardProps {
  matchId: string;
  homeTeam: string | null;
  homeTeamCode: string | null;
  homeTeamCrest?: string | null;
  awayTeam: string | null;
  awayTeamCode: string | null;
  awayTeamCrest?: string | null;
  kickoffTime: Date;
  status: string;
  stage: string;
  group?: string | null;
  homeScore?: number | null;
  awayScore?: number | null;
  userPick?: UserPick;
  distribution?: PickDistribution;
}

function StatusChip({ status }: { status: string }) {
  const config: Record<string, { label: string; bg: string; color: string }> = {
    IN_PLAY: { label: "Đang trực tiếp", bg: "var(--live)", color: "white" },
    PAUSED: { label: "Nghỉ giữa hiệp", bg: "var(--live)", color: "white" },
    FINISHED: { label: "Đã kết thúc", bg: "var(--outline)", color: "white" },
    TIMED: {
      label: "Sắp diễn ra",
      bg: "var(--surface-high)",
      color: "var(--outline)",
    },
    SCHEDULED: {
      label: "Sắp diễn ra",
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

// pick là undefined = user không dự đoán trận này
function PointsBadge({
  pick,
  status,
}: {
  pick: UserPick | undefined;
  status: string;
}) {
  const isMatchDone = status === "FINISHED";

  // Trận chưa kết thúc — không hiện gì
  if (!isMatchDone) return null;

  // Trận đã kết thúc nhưng user không dự đoán
  if (!pick) {
    return (
      <span
        className="text-xs px-2 py-1 rounded-[4px] uppercase tracking-wide font-bold"
        style={{
          background: "var(--surface-high)",
          color: "var(--outline)",
          fontFamily: "var(--font-body)",
        }}
      >
        — Không dự đoán +0 điểm
      </span>
    );
  }

  // Trận đã kết thúc nhưng chưa tính điểm
  if (pick.pointsAwarded === null) return null;

  // Sao Hy Vọng — sai
  if (pick.isStarOfHope && !pick.isCorrectWinner) {
    return (
      <span
        className="text-xs px-2 py-1 rounded-[4px] uppercase tracking-wide font-bold"
        style={{
          background: "var(--error)",
          color: "white",
          fontFamily: "var(--font-body)",
          opacity: 0.9,
        }}
      >
        ⭐ Sao sai {pick.pointsAwarded} điểm
      </span>
    );
  }

  // Dự đoán sai (không sao)
  if (!pick.isCorrectWinner) {
    return (
      <span
        className="text-xs px-2 py-1 rounded-[4px] uppercase tracking-wide font-bold"
        style={{
          background: "var(--error)",
          color: "white",
          fontFamily: "var(--font-body)",
          opacity: 0.8,
        }}
      >
        ✗ Dự đoán sai
      </span>
    );
  }

  // Sao Hy Vọng — đúng tỉ số
  if (pick.isStarOfHope && pick.isExactScore) {
    return (
      <span
        className="text-xs px-2 py-1 rounded-[4px] uppercase tracking-wide font-bold"
        style={{
          background: "var(--success)",
          color: "white",
          fontFamily: "var(--font-body)",
        }}
      >
        ⭐⚡ x2 +{pick.pointsAwarded} điểm
      </span>
    );
  }

  // Sao Hy Vọng — đúng đội thắng
  if (pick.isStarOfHope && pick.isCorrectWinner) {
    return (
      <span
        className="text-xs px-2 py-1 rounded-[4px] uppercase tracking-wide font-bold"
        style={{
          background: "var(--success)",
          color: "white",
          fontFamily: "var(--font-body)",
        }}
      >
        ⭐ x2 +{pick.pointsAwarded} điểm
      </span>
    );
  }

  // Đúng tỉ số chính xác
  if (pick.isExactScore) {
    return (
      <span
        className="text-xs px-2 py-1 rounded-[4px] uppercase tracking-wide font-bold"
        style={{
          background: "var(--success)",
          color: "white",
          fontFamily: "var(--font-body)",
        }}
      >
        ⚡ Đúng tỉ số +{pick.pointsAwarded} điểm
      </span>
    );
  }

  // Đúng đội thắng / hòa
  if (pick.isCorrectWinner) {
    return (
      <span
        className="text-xs font-bold uppercase tracking-wide px-2 py-1 rounded-[4px]"
        style={{
          background: "var(--surface-high)",
          color: "var(--foreground)",
          fontFamily: "var(--font-body)",
        }}
      >
        ✓ Đúng đội thắng/hòa +{pick.pointsAwarded} điểm
      </span>
    );
  }

  return null;
}

function TeamDisplay({
  name,
  code,
  crest,
}: {
  name: string | null;
  code: string | null;
  crest?: string | null;
}) {
  const isTBD = !name;
  const countryName = getCountryName(code, name);

  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      {crest && !isTBD ? (
        <Image
          src={crest}
          alt={countryName}
          width={48}
          height={48}
          className="object-contain"
          loading="lazy"
        />
      ) : (
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold"
          style={{
            background: isTBD ? "var(--surface-high)" : "var(--surface-muted)",
            color: "var(--outline)",
            fontFamily: "var(--font-display)",
            border: isTBD ? "2px dashed var(--outline-variant)" : "none",
          }}
        >
          {isTBD ? "?" : code}
        </div>
      )}

      <span
        className="text-base font-bold leading-none"
        style={{
          fontFamily: "var(--font-display)",
          letterSpacing: "0.02em",
          color: isTBD ? "var(--outline)" : "var(--foreground)",
        }}
      >
        {isTBD ? "TBD" : (code ?? name)}
      </span>

      {!isTBD && (
        <span
          className="text-xs leading-none"
          style={{
            color: "var(--outline)",
            fontFamily: "var(--font-body)",
            maxWidth: "80px",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {countryName}
        </span>
      )}
    </div>
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
  distribution,
}: MatchCardProps) {
  const kickoffLocal = new Date(kickoffTime).toLocaleString("vi-VN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  });

  const isFinished = status === "FINISHED";
  const isLive = status === "IN_PLAY" || status === "PAUSED";
  const isTBD = !homeTeam || !awayTeam;

  return (
    <div
      className="card-sports p-4 transition-shadow hover:shadow-md"
      style={{
        borderColor: isLive ? "var(--live)" : undefined,
        borderWidth: isLive ? "2px" : undefined,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <StatusChip status={status} />
        <span
          className="text-xs text-neutral-500 uppercase tracking-wide"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {group ?? stage} · {kickoffLocal}
        </span>
        {/* Render PointsBadge kể cả khi không có pick, miễn là trận FINISHED */}
        {isFinished && <PointsBadge pick={userPick} status={status} />}
      </div>

      {/* Teams */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <TeamDisplay
          name={homeTeam}
          code={homeTeamCode}
          crest={homeTeamCrest}
        />

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

        <TeamDisplay
          name={awayTeam}
          code={awayTeamCode}
          crest={awayTeamCrest}
        />
      </div>

      {/* Pick input */}
      <PickInput
        matchId={matchId}
        kickoffTime={kickoffTime}
        initialHome={userPick?.predictedHomeScore}
        initialAway={userPick?.predictedAwayScore}
        initialIsStarOfHope={userPick?.isStarOfHope}
        isKnockout={stage !== "GROUP_STAGE"}
        isTBD={isTBD}
      />

      {/* Distribution bar */}
      {distribution && (
        <PickDistributionBar
          homeCount={distribution.homeCount}
          drawCount={distribution.drawCount}
          total={distribution.total}
          homeTeamCode={homeTeamCode}
          awayTeamCode={awayTeamCode}
        />
      )}
    </div>
  );
}
