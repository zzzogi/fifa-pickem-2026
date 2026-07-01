// components/profile/profile-picks-list.tsx
"use client";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import type { ProfilePickRow, ProfilePick } from "@/lib/profile";
import { getCountryName } from "@/lib/team-names";

// ── Tooltip primitive ─────────────────────────────────────

function Tooltip({
  content,
  children,
}: {
  content: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("touchstart", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("touchstart", close);
    };
  }, [open]);

  const visible = open || hovered;

  return (
    <div ref={ref} className="relative inline-flex">
      <div
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ cursor: "pointer" }}
      >
        {children}
      </div>
      {/* pointer-events-none keeps the invisible area from triggering hover */}
      <div
        className="absolute bottom-full right-0 mb-1 z-50 pointer-events-none transition-opacity duration-150"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {content}
      </div>
    </div>
  );
}

// ── Score breakdown tooltip ───────────────────────────────

function TooltipCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs shadow-lg"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--outline-variant)",
        color: "var(--foreground)",
        fontFamily: "var(--font-body)",
        minWidth: "160px",
      }}
    >
      {children}
    </div>
  );
}

function TooltipRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 leading-relaxed">
      <span style={{ color: "var(--outline)" }}>
        {icon} {label}
      </span>
      <span
        className="font-bold tabular-nums"
        style={{ color: "var(--foreground)" }}
      >
        {value}
      </span>
    </div>
  );
}

function TooltipTotal({ points }: { points: number }) {
  const display = points > 0 ? `+${points}` : String(points);
  return (
    <div
      className="flex items-center justify-between gap-4 mt-1.5 pt-1.5 font-bold"
      style={{ borderTop: "1px solid var(--outline-variant)" }}
    >
      <span>Tổng cộng</span>
      <span className="tabular-nums">{display} điểm</span>
    </div>
  );
}

// pointsAwarded = base + streakBonus + starBonus + penaltyPointsAwarded
// so: streakBonus = pointsAwarded − base − starBonus − penaltyPointsAwarded
function ScoreBreakdownContent({ pick }: { pick: ProfilePick }) {
  if (pick.isStarOfHope && !pick.isCorrectWinner) {
    return (
      <TooltipCard>
        <TooltipRow icon="⭐" label="Sao Hy Vọng sai" value="−2" />
      </TooltipCard>
    );
  }

  if (!pick.isCorrectWinner) {
    return (
      <TooltipCard>
        <TooltipRow icon="✗" label="Dự đoán sai" value="0" />
      </TooltipCard>
    );
  }

  const basePoints = pick.isExactScore ? 3 : 1;
  const starBonus = pick.isStarOfHope ? 2 : 0;
  const penaltyBonus = pick.penaltyPointsAwarded;
  const streakBonus = pick.pointsAwarded - basePoints - starBonus - penaltyBonus;
  const hasBreakdown = streakBonus > 0 || starBonus > 0 || penaltyBonus > 0;

  return (
    <TooltipCard>
      {pick.isExactScore ? (
        <TooltipRow icon="⚡" label="Đúng tỉ số" value="+3" />
      ) : (
        <TooltipRow icon="✓" label="Đúng kết quả" value="+1" />
      )}
      {streakBonus > 0 && (
        <TooltipRow icon="🔥" label="Chuỗi liên tiếp" value={`+${streakBonus}`} />
      )}
      {starBonus > 0 && (
        <TooltipRow icon="⭐" label="Sao Hy Vọng" value="+2" />
      )}
      {penaltyBonus > 0 && (
        <TooltipRow
          icon="🥅"
          label={
            pick.isPenaltyExactScore ? "Tỉ số luân lưu" : "Đúng đội luân lưu"
          }
          value={`+${penaltyBonus}`}
        />
      )}
      {hasBreakdown && <TooltipTotal points={pick.pointsAwarded} />}
    </TooltipCard>
  );
}

// ── Badge trạng thái ──────────────────────────────────────

function PickResultBadge({ pick }: { pick: ProfilePick }) {
  // Chưa tính điểm (trận live/upcoming) — no tooltip
  if (!pick.scoredAt) {
    const config: Record<string, { label: string }> = {
      IN_PLAY: { label: "Đang trực tiếp" },
      PAUSED: { label: "Nghỉ giữa hiệp" },
      TIMED: { label: "Sắp diễn ra" },
      SCHEDULED: { label: "Sắp diễn ra" },
    };
    const label = config[pick.match.status]?.label ?? "Sắp diễn ra";
    return <Badge variant="neutral">{label}</Badge>;
  }

  const tooltipContent = <ScoreBreakdownContent pick={pick} />;

  // Sao Hy Vọng — sai
  if (pick.isStarOfHope && !pick.isCorrectWinner) {
    return (
      <Tooltip content={tooltipContent}>
        <Badge variant="wrong">
          <span className="sm:hidden">⭐ {pick.pointsAwarded}</span>
          <span className="hidden sm:inline">⭐ Sao sai {pick.pointsAwarded} điểm</span>
        </Badge>
      </Tooltip>
    );
  }

  // Sao Hy Vọng — đúng
  if (pick.isStarOfHope && pick.isCorrectWinner) {
    return (
      <Tooltip content={tooltipContent}>
        <Badge variant="exact">
          <span className="sm:hidden">
            {pick.isExactScore ? "⭐⚡" : "⭐"} +{pick.pointsAwarded}
          </span>
          <span className="hidden sm:inline">
            {pick.isExactScore ? "⭐⚡" : "⭐"} +{pick.pointsAwarded} điểm
          </span>
        </Badge>
      </Tooltip>
    );
  }

  if (pick.isExactScore) {
    return (
      <Tooltip content={tooltipContent}>
        <Badge variant="exact">
          <span className="sm:hidden">⚡ +{pick.pointsAwarded}</span>
          <span className="hidden sm:inline">
            ⚡ Đúng tỉ số +{pick.pointsAwarded} điểm
          </span>
        </Badge>
      </Tooltip>
    );
  }

  if (pick.isCorrectWinner) {
    return (
      <Tooltip content={tooltipContent}>
        <Badge variant="correct">
          <span className="sm:hidden">✓ +{pick.pointsAwarded}</span>
          <span className="hidden sm:inline">
            ✓ Đúng đội thắng +{pick.pointsAwarded} điểm
          </span>
        </Badge>
      </Tooltip>
    );
  }

  return (
    <Tooltip content={tooltipContent}>
      <Badge variant="wrong">
        <span className="sm:hidden">✗</span>
        <span className="hidden sm:inline">✗ Dự đoán sai</span>
      </Badge>
    </Tooltip>
  );
}

function MissedBadge() {
  return (
    <Badge variant="missed">
      <span className="sm:hidden">— +0</span>
      <span className="hidden sm:inline">— Không dự đoán +0 điểm</span>
    </Badge>
  );
}

// ── Badge primitive ───────────────────────────────────────

type BadgeVariant = "exact" | "correct" | "wrong" | "missed" | "neutral";

const BADGE_STYLES: Record<BadgeVariant, React.CSSProperties> = {
  exact: {
    background: "var(--success)",
    color: "white",
  },
  correct: {
    background: "var(--surface-high)",
    color: "var(--foreground)",
  },
  wrong: {
    background: "var(--error)",
    color: "white",
    opacity: 0.8,
  },
  missed: {
    background: "transparent",
    color: "var(--outline)",
    border: "1.5px dashed var(--outline-variant)",
  },
  neutral: {
    background: "var(--surface-high)",
    color: "var(--outline)",
  },
};

function Badge({
  variant,
  children,
}: {
  variant: BadgeVariant;
  children: React.ReactNode;
}) {
  return (
    <span
      className="text-xs font-bold uppercase tracking-wide px-2 py-1 rounded-[4px] whitespace-nowrap"
      style={{ fontFamily: "var(--font-body)", ...BADGE_STYLES[variant] }}
    >
      {children}
    </span>
  );
}

// ── Team info ─────────────────────────────────────────────

function TeamInfo({
  name,
  code,
  crest,
  muted,
}: {
  name: string | null;
  code: string | null;
  crest: string | null;
  muted?: boolean;
}) {
  return (
    <div
      className="flex items-center gap-2"
      style={{ opacity: muted ? 0.4 : 1 }}
    >
      {crest ? (
        <Image
          src={crest}
          alt={getCountryName(code, name)}
          width={20}
          height={20}
          className="object-contain flex-shrink-0"
          loading="lazy"
        />
      ) : (
        <div
          className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs"
          style={{
            background: "var(--surface-muted)",
            color: "var(--outline)",
          }}
        >
          {code?.charAt(0) ?? "?"}
        </div>
      )}
      <span
        className="text-sm font-bold"
        style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}
      >
        {code ?? name ?? "TBD"}
      </span>
    </div>
  );
}

// ── Rows ──────────────────────────────────────────────────

function PickRow({ pick }: { pick: ProfilePick }) {
  const { match } = pick;
  const matchDate = new Date(match.utcDate).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  });

  return (
    <div className="px-4 py-3 flex items-center gap-2">
      {/* Teams + predicted score */}
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <TeamInfo
          name={match.homeTeamName}
          code={match.homeTeamCode}
          crest={match.homeTeamCrest}
        />
        <span
          className="text-sm tabular-nums px-1 flex-shrink-0"
          style={{ fontFamily: "var(--font-display)", color: "var(--outline)" }}
        >
          {pick.predictedHomeScore}–{pick.predictedAwayScore}
        </span>
        <TeamInfo
          name={match.awayTeamName}
          code={match.awayTeamCode}
          crest={match.awayTeamCrest}
        />
      </div>

      {/* Penalty prediction (if any) */}
      {pick.predictedPenaltyHomeScore !== null &&
        pick.predictedPenaltyAwayScore !== null && (
          <span
            className="text-xs tabular-nums flex-shrink-0"
            style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}
          >
            🥅 {pick.predictedPenaltyHomeScore}–{pick.predictedPenaltyAwayScore}
            {pick.scoredAt && (
              <>
                {" "}
                {pick.isPenaltyWinnerCorrect
                  ? pick.isPenaltyExactScore
                    ? " ⚡+2"
                    : " ✓+1"
                  : " ✗"}
              </>
            )}
          </span>
        )}

      {/* Actual score */}
      {match.status === "FINISHED" &&
        match.homeScore !== null &&
        match.awayScore !== null && (
          <div
            className="text-xs px-2 py-1 rounded-[4px] tabular-nums flex-shrink-0"
            style={{
              background: "var(--surface-high)",
              color: "var(--outline)",
              fontFamily: "var(--font-body)",
            }}
          >
            <span className="sm:hidden">
              {match.homeScore}–{match.awayScore}
              {match.penaltyHomeScore !== null &&
                ` (${match.penaltyHomeScore}–${match.penaltyAwayScore})`}
            </span>
            <span className="hidden sm:inline">
              Kết quả: {match.homeScore}–{match.awayScore}
              {match.penaltyHomeScore !== null &&
                ` (llc: ${match.penaltyHomeScore}–${match.penaltyAwayScore})`}
            </span>
          </div>
        )}

      {/* Date + badge */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span
          className="text-xs hidden sm:block"
          style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}
        >
          {matchDate}
        </span>
        {pick.isStarOfHope && !pick.scoredAt && (
          <span
            className="text-xs font-bold px-2 py-1 rounded-[4px]"
            style={{
              background: "var(--primary-soft)",
              color: "var(--primary)",
              fontFamily: "var(--font-body)",
            }}
          >
            <span className="sm:hidden">⭐</span>
            <span className="hidden sm:inline">⭐ Sao Hy Vọng</span>
          </span>
        )}
        <PickResultBadge pick={pick} />
      </div>
    </div>
  );
}

function MissedRow({ match }: { match: ProfilePick["match"] }) {
  const matchDate = new Date(match.utcDate).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  });

  return (
    <div className="px-4 py-3 flex items-center gap-2" style={{ opacity: 0.6 }}>
      {/* Teams — muted, không có predicted score */}
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <TeamInfo
          name={match.homeTeamName}
          code={match.homeTeamCode}
          crest={match.homeTeamCrest}
          muted
        />
        <span
          className="text-sm tabular-nums px-1 flex-shrink-0"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--outline-variant)",
          }}
        >
          ?–?
        </span>
        <TeamInfo
          name={match.awayTeamName}
          code={match.awayTeamCode}
          crest={match.awayTeamCrest}
          muted
        />
      </div>

      {/* Actual score */}
      {match.homeScore !== null && match.awayScore !== null && (
        <div
          className="text-xs px-2 py-1 rounded-[4px] tabular-nums flex-shrink-0"
          style={{
            background: "var(--surface-high)",
            color: "var(--outline)",
            fontFamily: "var(--font-body)",
          }}
        >
          <span className="sm:hidden">
            {match.homeScore}–{match.awayScore}
            {match.penaltyHomeScore !== null &&
              ` (${match.penaltyHomeScore}–${match.penaltyAwayScore})`}
          </span>
          <span className="hidden sm:inline">
            Kết quả: {match.homeScore}–{match.awayScore}
            {match.penaltyHomeScore !== null &&
              ` (llc: ${match.penaltyHomeScore}–${match.penaltyAwayScore})`}
          </span>
        </div>
      )}

      {/* Date + badge */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span
          className="text-xs hidden sm:block"
          style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}
        >
          {matchDate}
        </span>
        <MissedBadge />
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────

export default function ProfilePicksList({
  pickRows,
}: {
  pickRows: ProfilePickRow[];
}) {
  const finishedRows = pickRows.filter(
    (r) =>
      r.kind === "missed" ||
      (r.kind === "pick" && r.pick.match.status === "FINISHED"),
  );
  const pendingRows = pickRows.filter(
    (r) => r.kind === "pick" && r.pick.match.status !== "FINISHED",
  );

  if (pickRows.length === 0) {
    return (
      <div className="card-sports p-10 text-center">
        <p
          className="text-3xl mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Chưa có dự đoán nào
        </p>
        <p style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}>
          Người chơi này chưa đưa ra dự đoán nào.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upcoming picks */}
      {pendingRows.length > 0 && (
        <section>
          <h3
            className="text-xs uppercase tracking-widest mb-3 pb-2 border-b font-bold"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--outline)",
              borderColor: "var(--outline-variant)",
            }}
          >
            Những trận sắp diễn ra ({pendingRows.length})
          </h3>
          <div
            className="card-sports divide-y"
            style={{ borderColor: "var(--outline-variant)" }}
          >
            {pendingRows.map(
              (r) =>
                r.kind === "pick" && <PickRow key={r.pick.id} pick={r.pick} />,
            )}
          </div>
        </section>
      )}

      {/* Finished — picks + missed xen kẽ */}
      {finishedRows.length > 0 && (
        <section>
          <h3
            className="text-xs uppercase tracking-widest mb-3 pb-2 border-b font-bold"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--outline)",
              borderColor: "var(--outline-variant)",
            }}
          >
            Kết quả ({finishedRows.length})
          </h3>
          <div
            className="card-sports divide-y"
            style={{ borderColor: "var(--outline-variant)" }}
          >
            {finishedRows.map((r, i) => {
              if (r.kind === "pick") {
                return <PickRow key={r.pick.id} pick={r.pick} />;
              }
              return <MissedRow key={`missed-${r.match.id}`} match={r.match} />;
            })}
          </div>
        </section>
      )}
    </div>
  );
}
