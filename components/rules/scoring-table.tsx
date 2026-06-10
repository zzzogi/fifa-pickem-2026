// components/rules/scoring-table.tsx

export default function ScoringTable() {
  return (
    <div className="card-sports p-6">
      <h2
        className="text-2xl mb-6"
        style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}
      >
        SCORING RULES
      </h2>

      {/* Base scoring */}
      <div className="mb-6">
        <h3
          className="text-xs uppercase tracking-widest mb-3 font-bold"
          style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}
        >
          Base Points
        </h3>
        <div
          className="overflow-hidden rounded-[4px] border"
          style={{ borderColor: "var(--outline-variant)" }}
        >
          <table className="w-full">
            <thead>
              <tr style={{ background: "var(--secondary)" }}>
                {["Prediction", "Example", "Result", "Points"].map((h) => (
                  <th
                    key={h}
                    className="py-2.5 px-4 text-left text-xs uppercase tracking-widest text-white font-bold"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                {
                  prediction: "Exact Score",
                  example: "Predict 2–1, Result 2–1",
                  result: "Perfect match",
                  points: "+3",
                  highlight: true,
                },
                {
                  prediction: "Correct Winner",
                  example: "Predict 1–0, Result 2–1",
                  result: "Right team wins",
                  points: "+1",
                  highlight: false,
                },
                {
                  prediction: "Correct Draw",
                  example: "Predict 1–1, Result 0–0",
                  result: "Both predict draw",
                  points: "+1",
                  highlight: false,
                },
                {
                  prediction: "Wrong",
                  example: "Predict 2–0, Result 0–1",
                  result: "Wrong winner",
                  points: "0",
                  highlight: false,
                },
              ].map((row, i) => (
                <tr
                  key={row.prediction}
                  style={{
                    background: row.highlight
                      ? "rgba(67,122,34,0.06)"
                      : i % 2 === 0
                        ? "var(--surface)"
                        : "var(--surface-soft)",
                    borderBottom: "1px solid var(--outline-variant)",
                  }}
                >
                  <td className="py-3 px-4">
                    <span
                      className="text-sm font-bold"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {row.prediction}
                    </span>
                  </td>
                  <td
                    className="py-3 px-4 text-sm"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--outline)",
                    }}
                  >
                    {row.example}
                  </td>
                  <td
                    className="py-3 px-4 text-sm hidden sm:table-cell"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--outline)",
                    }}
                  >
                    {row.result}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className="text-lg tabular-nums"
                      style={{
                        fontFamily: "var(--font-display)",
                        color: row.highlight
                          ? "var(--success)"
                          : row.points === "0"
                            ? "var(--outline)"
                            : "var(--foreground)",
                      }}
                    >
                      {row.points}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Streak bonus */}
      <div>
        <h3
          className="text-xs uppercase tracking-widest mb-3 font-bold"
          style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}
        >
          Streak Bonus — Consecutive Correct Picks
        </h3>
        <div
          className="overflow-hidden rounded-[4px] border"
          style={{ borderColor: "var(--outline-variant)" }}
        >
          <table className="w-full">
            <thead>
              <tr style={{ background: "var(--secondary)" }}>
                {["Streak", "Tier", "Bonus Per Pick", "Total Example"].map(
                  (h) => (
                    <th
                      key={h}
                      className="py-2.5 px-4 text-left text-xs uppercase tracking-widest text-white font-bold"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {[
                {
                  streak: "1–2",
                  tier: "—",
                  bonus: "+0",
                  example: "1pt (correct winner)",
                  tierColor: "var(--outline)",
                },
                {
                  streak: "3–4",
                  tier: "🔥",
                  bonus: "+1",
                  example: "2pt per correct winner",
                  tierColor: "#f97316",
                },
                {
                  streak: "5–7",
                  tier: "🔥🔥",
                  bonus: "+2",
                  example: "3pt per correct winner",
                  tierColor: "#ef4444",
                },
                {
                  streak: "8+",
                  tier: "🔥🔥🔥",
                  bonus: "+3",
                  example: "4pt per correct winner",
                  tierColor: "#dc2626",
                },
              ].map((row, i) => (
                <tr
                  key={row.streak}
                  style={{
                    background:
                      i % 2 === 0 ? "var(--surface)" : "var(--surface-soft)",
                    borderBottom: "1px solid var(--outline-variant)",
                  }}
                >
                  <td className="py-3 px-4">
                    <span
                      className="text-lg tabular-nums"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {row.streak}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span style={{ fontSize: "1.1rem" }}>{row.tier}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className="text-lg font-bold tabular-nums"
                      style={{
                        fontFamily: "var(--font-display)",
                        color: row.tierColor,
                      }}
                    >
                      {row.bonus}
                    </span>
                  </td>
                  <td
                    className="py-3 px-4 text-sm hidden sm:table-cell"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--outline)",
                    }}
                  >
                    {row.example}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p
          className="text-xs mt-3"
          style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}
        >
          ⚠️ A wrong prediction resets your streak to 0. Streak bonus applies on
          top of base points.
        </p>
      </div>
    </div>
  );
}
