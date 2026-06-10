// components/home/rules-prize-modal.tsx
"use client";

import { useEffect } from "react";

interface RulesPrizeModalProps {
  open: boolean;
  onClose: () => void;
}

const prizes = [
  { rank: "1st", reward: "500,000 VNĐ", icon: "🥇" },
  { rank: "2nd", reward: "200,000 VNĐ", icon: "🥈" },
  { rank: "3rd", reward: "100,000 VNĐ", icon: "🥉" },
  { rank: "Most Exact", reward: "Special Prize", icon: "⚡" },
];

const scoring = [
  { label: "Exact score", points: "+3" },
  { label: "Correct winner", points: "+1" },
  { label: "Wrong pick", points: "0" },
];

const streaks = [
  { streak: "3–4", bonus: "+1", fire: "🔥" },
  { streak: "5–7", bonus: "+2", fire: "🔥🔥" },
  { streak: "8+", bonus: "+3", fire: "🔥🔥🔥" },
];

export default function RulesPrizeModal({
  open,
  onClose,
}: RulesPrizeModalProps) {
  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center md:items-center"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0"
        style={{ background: "rgba(20, 20, 20, 0.6)" }}
      />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-2xl rounded-t-xl md:rounded-xl border max-h-[90vh] overflow-y-auto"
        style={{
          background: "var(--surface)",
          borderColor: "var(--outline-variant)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 flex items-center justify-between px-5 py-4 border-b"
          style={{
            background: "var(--surface)",
            borderColor: "var(--outline-variant)",
          }}
        >
          <div>
            <p
              className="text-xs uppercase tracking-widest mb-1"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--outline)",
                fontWeight: 700,
              }}
            >
              FIFA World Cup 2026
            </p>
            <h2
              className="text-2xl"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--primary)",
                letterSpacing: "0.02em",
              }}
            >
              RULES & PRIZE POOL
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-[4px] border transition hover:opacity-80"
            style={{
              borderColor: "var(--outline-variant)",
              color: "var(--outline)",
            }}
          >
            ✕
          </button>
        </div>

        <div className="space-y-6 px-5 py-5">
          {/* How to play */}
          <section>
            <h3
              className="mb-3 text-xs uppercase tracking-widest"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--outline)",
                fontWeight: 700,
              }}
            >
              How to play
            </h3>

            <div className="grid gap-3">
              {[
                "Sign in with Google to join the game.",
                "Go to My Picks and predict the score of each match.",
                "You can edit your pick until kickoff.",
                "After kickoff, picks are locked automatically.",
                "Points are awarded after matches finish.",
                "Build streaks and climb the leaderboard.",
              ].map((item, index) => (
                <div
                  key={item}
                  className="flex gap-3 rounded-[4px] border p-3"
                  style={{
                    borderColor:
                      index === 0 ? "var(--primary)" : "var(--outline-variant)",
                    background:
                      index === 0
                        ? "rgba(87,0,0,0.04)"
                        : "var(--surface-container-low)",
                  }}
                >
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[4px]"
                    style={{
                      background:
                        index === 0 ? "var(--primary)" : "var(--surface-high)",
                      color: index === 0 ? "white" : "var(--outline)",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {index + 1}
                  </div>
                  <p
                    className="text-sm"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--on-surface)",
                    }}
                  >
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Scoring */}
          <section>
            <h3
              className="mb-3 text-xs uppercase tracking-widest"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--outline)",
                fontWeight: 700,
              }}
            >
              Scoring
            </h3>

            <div
              className="overflow-hidden rounded-[4px] border"
              style={{ borderColor: "var(--outline-variant)" }}
            >
              <table className="w-full">
                <thead>
                  <tr style={{ background: "var(--secondary)" }}>
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-white">
                      Type
                    </th>
                    <th className="px-4 py-3 text-right text-xs uppercase tracking-widest text-white">
                      Points
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {scoring.map((row, i) => (
                    <tr
                      key={row.label}
                      style={{
                        background:
                          i % 2 === 0
                            ? "var(--surface)"
                            : "var(--surface-container-low)",
                        borderTop: "1px solid var(--outline-variant)",
                      }}
                    >
                      <td
                        className="px-4 py-3 text-sm"
                        style={{
                          fontFamily: "var(--font-body)",
                          color: "var(--on-surface)",
                        }}
                      >
                        {row.label}
                      </td>
                      <td
                        className="px-4 py-3 text-right"
                        style={{
                          fontFamily: "var(--font-display)",
                          color: "var(--primary)",
                        }}
                      >
                        {row.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Streak bonus */}
          <section>
            <h3
              className="mb-3 text-xs uppercase tracking-widest"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--outline)",
                fontWeight: 700,
              }}
            >
              Streak bonus
            </h3>

            <div className="grid gap-3 sm:grid-cols-3">
              {streaks.map((item) => (
                <div
                  key={item.streak}
                  className="rounded-[4px] border p-4 text-center"
                  style={{
                    borderColor: "var(--outline-variant)",
                    background: "var(--surface-container-low)",
                  }}
                >
                  <div className="mb-1 text-lg">{item.fire}</div>
                  <p
                    className="text-xs uppercase tracking-wide"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--outline)",
                      fontWeight: 700,
                    }}
                  >
                    Streak {item.streak}
                  </p>
                  <p
                    className="text-2xl"
                    style={{
                      fontFamily: "var(--font-display)",
                      color: "var(--primary)",
                    }}
                  >
                    {item.bonus}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Prize pool */}
          <section>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3
                className="text-xs uppercase tracking-widest"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--outline)",
                  fontWeight: 700,
                }}
              >
                Prize pool
              </h3>

              <span
                className="rounded-[4px] px-3 py-1 text-xs uppercase tracking-wide"
                style={{
                  background: "var(--primary)",
                  color: "white",
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                }}
              >
                Total 800,000 VNĐ
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {prizes.map((prize) => (
                <div
                  key={prize.rank}
                  className="rounded-[4px] border p-4"
                  style={{
                    borderColor: "var(--outline-variant)",
                    background: "var(--surface-container-low)",
                  }}
                >
                  <div className="mb-2 flex items-center gap-3">
                    <span className="text-xl">{prize.icon}</span>
                    <p
                      className="text-xs uppercase tracking-wide"
                      style={{
                        fontFamily: "var(--font-body)",
                        color: "var(--outline)",
                        fontWeight: 700,
                      }}
                    >
                      {prize.rank}
                    </p>
                  </div>
                  <p
                    className="text-2xl"
                    style={{
                      fontFamily: "var(--font-display)",
                      color: "var(--primary)",
                    }}
                  >
                    {prize.reward}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
