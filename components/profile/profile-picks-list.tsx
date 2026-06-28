// components/profile/profile-picks-list.tsx
import Image from "next/image";
import type { ProfilePickRow, ProfilePick } from "@/lib/profile";
import { getCountryName } from "@/lib/team-names";

// ── Badge trạng thái ──────────────────────────────────────

function PickResultBadge({ pick }: { pick: ProfilePick }) {
  // Chưa tính điểm (trận live/upcoming)
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

  // Sao Hy Vọng — sai
  if (pick.isStarOfHope && !pick.isCorrectWinner) {
    return (
      <Badge variant="wrong">
        <span className="sm:hidden">⭐ {pick.pointsAwarded}</span>
        <span className="hidden sm:inline">⭐ Sao sai {pick.pointsAwarded} điểm</span>
      </Badge>
    );
  }

  // Sao Hy Vọng — đúng
  if (pick.isStarOfHope && pick.isCorrectWinner) {
    return (
      <Badge variant="exact">
        <span className="sm:hidden">{pick.isExactScore ? "⭐⚡" : "⭐"} +{pick.pointsAwarded}</span>
        <span className="hidden sm:inline">
          {pick.isExactScore ? "⭐⚡" : "⭐"} +{pick.pointsAwarded} điểm
        </span>
      </Badge>
    );
  }

  if (pick.isExactScore) {
    return (
      <Badge variant="exact">
        <span className="sm:hidden">⚡ +{pick.pointsAwarded}</span>
        <span className="hidden sm:inline">
          ⚡ Đúng tỉ số +{pick.pointsAwarded} điểm
        </span>
      </Badge>
    );
  }

  if (pick.isCorrectWinner) {
    return (
      <Badge variant="correct">
        <span className="sm:hidden">✓ +{pick.pointsAwarded}</span>
        <span className="hidden sm:inline">
          ✓ Đúng đội thắng +{pick.pointsAwarded} điểm
        </span>
      </Badge>
    );
  }

  return (
    <Badge variant="wrong">
      <span className="sm:hidden">✗</span>
      <span className="hidden sm:inline">✗ Dự đoán sai</span>
    </Badge>
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
            className="text-xs tabular-nums flex-shrink-0 hidden sm:inline"
            style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}
          >
            🥅 {pick.predictedPenaltyHomeScore}–{pick.predictedPenaltyAwayScore}
            {pick.scoredAt && (
              <> {pick.isPenaltyWinnerCorrect ? (pick.isPenaltyExactScore ? " ⚡+2" : " ✓+1") : " ✗"}</>
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
              {match.penaltyHomeScore !== null && ` (${match.penaltyHomeScore}–${match.penaltyAwayScore})`}
            </span>
            <span className="hidden sm:inline">
              Kết quả: {match.homeScore}–{match.awayScore}
              {match.penaltyHomeScore !== null && ` (llc: ${match.penaltyHomeScore}–${match.penaltyAwayScore})`}
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
            {match.penaltyHomeScore !== null && ` (${match.penaltyHomeScore}–${match.penaltyAwayScore})`}
          </span>
          <span className="hidden sm:inline">
            Kết quả: {match.homeScore}–{match.awayScore}
            {match.penaltyHomeScore !== null && ` (llc: ${match.penaltyHomeScore}–${match.penaltyAwayScore})`}
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
