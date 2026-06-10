// components/rules/prize-pool-card.tsx

const prizes = [
  {
    rank: "1st",
    medal: "🥇",
    reward: "500,000 VNĐ",
    bg: "#d19900",
    color: "white",
    desc: "Top of the leaderboard when the World Cup final whistle blows",
  },
  {
    rank: "2nd",
    medal: "🥈",
    reward: "200,000 VNĐ",
    bg: "#8e706c",
    color: "white",
    desc: "Second place at the end of the tournament",
  },
  {
    rank: "3rd",
    medal: "🥉",
    reward: "100,000 VNĐ",
    bg: "#964219",
    color: "white",
    desc: "Third place at the end of the tournament",
  },
  {
    rank: "Most Exact",
    medal: "⚡",
    reward: "Special Prize",
    bg: "var(--primary)",
    color: "white",
    desc: "Player with the highest number of exact score predictions",
  },
];

const rules = [
  "Rankings are final as of the FIFA World Cup 2026 Final match result.",
  "Tiebreakers: Total Points → Correct Picks → Exact Scores.",
  "Prizes are distributed within 7 days after the tournament ends.",
  "Participants must have submitted at least 10 picks to be eligible.",
  "The organizer reserves the right to disqualify any participant found cheating.",
];

export default function PrizePoolCard() {
  return (
    <div className="card-sports p-6">
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <h2
          className="text-2xl"
          style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}
        >
          PRIZE POOL
        </h2>
        {/* Total pool badge */}
        <div
          className="px-4 py-2 rounded-[4px]"
          style={{ background: "var(--primary)", color: "white" }}
        >
          <p
            className="text-xs uppercase tracking-widest mb-0.5"
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              opacity: 0.8,
            }}
          >
            Total Pool
          </p>
          <p
            className="text-xl leading-none"
            style={{ fontFamily: "var(--font-display)" }}
          >
            800,000 VNĐ
          </p>
        </div>
      </div>

      {/* Prize cards */}
      <div className="grid gap-3 sm:grid-cols-2 mb-6">
        {prizes.map((prize) => (
          <div
            key={prize.rank}
            className="flex items-start gap-4 p-4 rounded-[4px]"
            style={{
              background: "var(--surface-soft)",
              border: "1px solid var(--outline-variant)",
            }}
          >
            {/* Medal + rank */}
            <div
              className="flex-shrink-0 w-12 h-12 rounded-[4px] flex flex-col items-center justify-center"
              style={{ background: prize.bg }}
            >
              <span style={{ fontSize: "1.3rem", lineHeight: 1 }}>
                {prize.medal}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-0.5 flex-wrap">
                <span
                  className="text-sm uppercase tracking-wide font-bold"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--outline)",
                  }}
                >
                  {prize.rank}
                </span>
                <span
                  className="text-xl leading-none"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--foreground)",
                  }}
                >
                  {prize.reward}
                </span>
              </div>
              <p
                className="text-xs"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--outline)",
                  lineHeight: 1.5,
                }}
              >
                {prize.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Prize rules */}
      <div
        className="p-4 rounded-[4px]"
        style={{
          background: "var(--surface-soft)",
          border: "1px solid var(--outline-variant)",
        }}
      >
        <h3
          className="text-xs uppercase tracking-widest mb-3 font-bold"
          style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}
        >
          Terms & Conditions
        </h3>
        <ul className="space-y-2">
          {rules.map((rule, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--outline)",
                lineHeight: 1.6,
              }}
            >
              <span
                className="flex-shrink-0 mt-0.5 text-xs font-bold"
                style={{ color: "var(--primary)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              {rule}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
