// components/profile/profile-picks-list.tsx
import Image from "next/image";
import type { ProfilePick } from "@/lib/profile";

function PickResultBadge({ pick }: { pick: ProfilePick }) {
  if (!pick.scoredAt) {
    return (
      <span
        className="text-xs px-2 py-1 rounded-[4px] uppercase tracking-wide font-bold"
        style={{
          background: "var(--surface-high)",
          color: "var(--outline)",
          fontFamily: "var(--font-body)",
        }}
      >
        Sắp diễn ra
      </span>
    );
  }

  if (pick.isExactScore) {
    return (
      <span
        className="text-xs px-2 py-1 rounded-[4px] uppercase tracking-wide font-bold"
        style={{
          background: "var(--success)",
          color: "white",
          fontFamily: "var(--font-body)",
          whiteSpace: "nowrap",
        }}
      >
        {/* Mobile: ⚡+điểm, desktop: full */}
        <span className="sm:hidden">⚡ +{pick.pointsAwarded}</span>
        <span className="hidden sm:inline">
          ⚡ Đúng tỉ số +{pick.pointsAwarded} điểm
        </span>
      </span>
    );
  }

  if (pick.isCorrectWinner) {
    return (
      <span
        className="text-xs px-2 py-1 rounded-[4px] uppercase tracking-wide font-bold"
        style={{
          background: "var(--surface-high)",
          color: "var(--foreground)",
          fontFamily: "var(--font-body)",
          whiteSpace: "nowrap",
        }}
      >
        {/* Mobile: ✓+điểm, desktop: full */}
        <span className="sm:hidden">✓ +{pick.pointsAwarded}</span>
        <span className="hidden sm:inline">
          ✓ Dự đoán đúng +{pick.pointsAwarded} điểm
        </span>
      </span>
    );
  }

  return (
    <span
      className="text-xs px-2 py-1 rounded-[4px] uppercase tracking-wide font-bold"
      style={{
        background: "var(--error)",
        color: "white",
        fontFamily: "var(--font-body)",
        opacity: 0.8,
        whiteSpace: "nowrap",
      }}
    >
      {/* Mobile: icon only, desktop: full */}
      <span className="sm:hidden">✗</span>
      <span className="hidden sm:inline">✗ Dự đoán sai</span>
    </span>
  );
}

function TeamInfo({
  name,
  code,
  crest,
}: {
  name: string | null;
  code: string | null;
  crest: string | null;
}) {
  return (
    <div className="flex items-center gap-2">
      {crest ? (
        <Image
          src={crest}
          alt={name ?? "TBD"}
          width={24}
          height={24}
          className="object-contain flex-shrink-0"
          loading="lazy"
        />
      ) : (
        <div
          className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs"
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

export default function ProfilePicksList({ picks }: { picks: ProfilePick[] }) {
  const scoredPicks = picks.filter(
    (p) => p.match.status === "FINISHED" || p.scoredAt !== null,
  );

  const pendingPicks = picks.filter(
    (p) => p.match.status !== "FINISHED" && p.scoredAt === null,
  );

  if (picks.length === 0) {
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
      {pendingPicks.length > 0 && (
        <section>
          <h3
            className="text-xs uppercase tracking-widest mb-3 pb-2 border-b font-bold"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--outline)",
              borderColor: "var(--outline-variant)",
            }}
          >
            Những trận sắp diễn ra ({pendingPicks.length})
          </h3>
          <div
            className="card-sports divide-y"
            style={{ borderColor: "var(--outline-variant)" }}
          >
            {pendingPicks.map((pick) => (
              <PickRow key={pick.id} pick={pick} />
            ))}
          </div>
        </section>
      )}

      {scoredPicks.length > 0 && (
        <section>
          <h3
            className="text-xs uppercase tracking-widest mb-3 pb-2 border-b font-bold"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--outline)",
              borderColor: "var(--outline-variant)",
            }}
          >
            Kết quả ({scoredPicks.length})
          </h3>
          <div
            className="card-sports divide-y"
            style={{ borderColor: "var(--outline-variant)" }}
          >
            {scoredPicks.map((pick) => (
              <PickRow key={pick.id} pick={pick} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function PickRow({ pick }: { pick: ProfilePick }) {
  const { match } = pick;

  const matchDate = new Date(match.utcDate).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  });

  return (
    <div
      className="px-4 py-3 flex items-center gap-2"
      style={{
        background: pick.isExactScore
          ? "rgba(67,122,34,0.05)"
          : pick.scoredAt && !pick.isCorrectWinner
            ? "rgba(186,26,26,0.04)"
            : "transparent",
      }}
    >
      {/* Teams + predicted score — flex-1 để chiếm không gian còn lại */}
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <TeamInfo
          name={match.homeTeamName}
          code={match.homeTeamCode}
          crest={match.homeTeamCrest}
        />

        <span
          className="text-sm tabular-nums px-1 flex-shrink-0"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--outline)",
          }}
        >
          {pick.predictedHomeScore}-{pick.predictedAwayScore}
        </span>

        <TeamInfo
          name={match.awayTeamName}
          code={match.awayTeamCode}
          crest={match.awayTeamCrest}
        />
      </div>

      {/* Actual score — mobile: chỉ tỉ số, desktop: giữ nguyên */}
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
            {/* Mobile: tỉ số only */}
            <span className="sm:hidden">
              {match.homeScore}-{match.awayScore}
            </span>
            {/* Desktop: có chữ "Kết quả" */}
            <span className="hidden sm:inline">
              Kết quả: {match.homeScore}-{match.awayScore}
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
