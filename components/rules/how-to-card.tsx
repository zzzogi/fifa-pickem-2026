// components/rules/how-to-card.tsx

const steps = [
  {
    number: "01",
    title: "Sign In",
    desc: "Log in with your Google account. No registration needed — one click and you're in.",
  },
  {
    number: "02",
    title: "Find a Match",
    desc: 'Head to "My Picks" and browse the World Cup schedule. All 104 matches are listed.',
  },
  {
    number: "03",
    title: "Submit Your Prediction",
    desc: "Enter the score you think will happen — home goals and away goals. Hit Save Pick.",
  },
  {
    number: "04",
    title: "Lock In Before Kickoff",
    desc: "You can edit your pick anytime before the match starts. Once the whistle blows, picks are locked.",
  },
  {
    number: "05",
    title: "Earn Points Automatically",
    desc: "After the final whistle, points are calculated automatically. No need to do anything.",
  },
  {
    number: "06",
    title: "Climb the Leaderboard",
    desc: "Check the leaderboard to see where you rank against everyone else. May the best predictor win.",
  },
];

export default function HowToCard() {
  return (
    <div className="card-sports p-6">
      <h2
        className="text-2xl mb-6"
        style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}
      >
        HOW TO PLAY
      </h2>

      <div className="space-y-0">
        {steps.map((step, index) => (
          <div
            key={step.number}
            className="flex gap-4 pb-6"
            style={{
              borderLeft:
                index < steps.length - 1
                  ? "2px solid var(--outline-variant)"
                  : "2px solid transparent",
              marginLeft: "15px",
              paddingLeft: "24px",
              position: "relative",
            }}
          >
            {/* Circle — step 01 dùng màu primary đậm hơn */}
            <div
              className="absolute flex items-center justify-center rounded-full text-sm font-bold flex-shrink-0"
              style={{
                width: 32,
                height: 32,
                left: -16,
                top: 0,
                background:
                  index === 0 ? "var(--primary)" : "var(--surface-high)",
                color: index === 0 ? "white" : "var(--outline)",
                fontFamily: "var(--font-display)",
                fontSize: "0.9rem",
                // Glow cho step 1
                boxShadow:
                  index === 0
                    ? "0 0 0 4px oklch(from var(--primary) l c h / 0.2)"
                    : "none",
              }}
            >
              {step.number}
            </div>

            <div className="pt-0.5">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3
                  className="text-base font-bold"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 700,
                    color: "var(--foreground)",
                  }}
                >
                  {step.title}
                </h3>

                {/* Badge "Start here" cho step 01 */}
                {index === 0 && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-[4px] font-bold uppercase tracking-wide"
                    style={{
                      background: "var(--primary)",
                      color: "white",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    Start here
                  </span>
                )}
              </div>

              <p
                className="text-sm"
                style={{
                  color: "var(--outline)",
                  fontFamily: "var(--font-body)",
                  lineHeight: 1.6,
                }}
              >
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
