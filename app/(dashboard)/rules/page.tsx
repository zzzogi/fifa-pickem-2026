// app/(dashboard)/rules/page.tsx
import HowToCard from "@/components/rules/how-to-card";
import ScoringTable from "@/components/rules/scoring-table";
import PrizePoolCard from "@/components/rules/prize-pool-card";

export default function RulesPage() {
  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <p
          className="text-xs uppercase tracking-widest mb-1"
          style={{
            color: "var(--outline)",
            fontFamily: "var(--font-body)",
            fontWeight: 700,
          }}
        >
          FIFA World Cup 2026
        </p>
        <h1
          className="text-4xl"
          style={{
            fontFamily: "var(--font-display)",
            letterSpacing: "0.02em",
          }}
        >
          RULES & PRIZES
        </h1>
      </div>

      {/* Intro banner */}
      <div
        className="rounded-[4px] p-5 mb-6 flex items-start gap-4"
        style={{
          background: "var(--primary)",
          color: "white",
        }}
      >
        <span style={{ fontSize: "2rem", lineHeight: 1, flexShrink: 0 }}>
          ⚽
        </span>
        <div>
          <h2
            className="text-xl mb-1"
            style={{
              fontFamily: "var(--font-display)",
              letterSpacing: "0.02em",
            }}
          >
            FIFA WORLD CUP 2026 PICK'EM
          </h2>
          <p
            className="text-sm"
            style={{
              fontFamily: "var(--font-body)",
              opacity: 0.9,
              lineHeight: 1.6,
            }}
          >
            Predict the score of every World Cup match. Earn points for correct
            results and exact scores. Build streaks to multiply your points. The
            best predictor takes the prize.
          </p>
        </div>
      </div>

      {/* Content grid — 1 cột mobile, 2 cột desktop */}
      <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
        <div className="space-y-6">
          <HowToCard />
          <ScoringTable />
        </div>
        <div>
          <PrizePoolCard />
        </div>
      </div>
    </div>
  );
}
