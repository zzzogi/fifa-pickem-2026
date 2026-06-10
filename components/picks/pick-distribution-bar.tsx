// components/picks/pick-distribution-bar.tsx

interface PickDistributionBarProps {
  homeCount: number;
  awayCount: number;
  drawCount: number;
  total: number;
  homeTeamCode: string | null;
  awayTeamCode: string | null;
}

export default function PickDistributionBar({
  homeCount,
  awayCount,
  drawCount,
  total,
  homeTeamCode,
  awayTeamCode,
}: PickDistributionBarProps) {
  if (total === 0) {
    return (
      <div
        className="mt-3 pt-3 border-t"
        style={{ borderColor: "var(--outline-variant)" }}
      >
        <p
          className="text-xs uppercase tracking-wide text-center"
          style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}
        >
          No picks yet — be the first!
        </p>
      </div>
    );
  }

  const homePct = Math.round((homeCount / total) * 100);
  const drawPct = Math.round((drawCount / total) * 100);
  // awayPct tính từ phần còn lại để tổng luôn = 100
  const awayPct = 100 - homePct - drawPct;

  return (
    <div
      className="mt-3 pt-3 border-t"
      style={{ borderColor: "var(--outline-variant)" }}
    >
      {/* Labels trên thanh */}
      <div className="flex items-center justify-between mb-1.5">
        <span
          className="text-xs font-bold uppercase tracking-wide"
          style={{ color: "var(--foreground)", fontFamily: "var(--font-body)" }}
        >
          {homeTeamCode ?? "Home"} {homePct}%
        </span>
        {drawPct > 0 && (
          <span
            className="text-xs uppercase tracking-wide"
            style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}
          >
            Draw {drawPct}%
          </span>
        )}
        <span
          className="text-xs font-bold uppercase tracking-wide"
          style={{ color: "var(--foreground)", fontFamily: "var(--font-body)" }}
        >
          {awayPct}% {awayTeamCode ?? "Away"}
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="flex h-2 rounded-full overflow-hidden"
        style={{ background: "var(--surface-high)" }}
      >
        {/* Home */}
        {homePct > 0 && (
          <div
            style={{
              width: `${homePct}%`,
              background: "var(--primary)",
              transition: "width 0.4s ease",
            }}
          />
        )}
        {/* Draw */}
        {drawPct > 0 && (
          <div
            style={{
              width: `${drawPct}%`,
              background: "var(--outline-variant)",
              transition: "width 0.4s ease",
            }}
          />
        )}
        {/* Away */}
        {awayPct > 0 && (
          <div
            style={{
              width: `${awayPct}%`,
              background: "var(--secondary)",
              transition: "width 0.4s ease",
            }}
          />
        )}
      </div>

      {/* Tổng số picks */}
      <p
        className="text-xs mt-1.5 text-center"
        style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}
      >
        {total} {total === 1 ? "pick" : "picks"} submitted
      </p>
    </div>
  );
}
