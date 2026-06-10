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
            {/* Circle số */}
            <div
              className="absolute flex items-center justify-center rounded-full text-sm font-bold flex-shrink-0"
              style={{
                width: 32,
                height: 32,
                left: -16,
                top: 0,
                background: "var(--primary)",
                color: "white",
                fontFamily: "var(--font-display)",
                fontSize: "0.9rem",
              }}
            >
              {step.number}
            </div>

            <div className="pt-0.5">
              <h3
                className="text-base font-bold mb-1"
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  color: "var(--foreground)",
                }}
              >
                {step.title}
              </h3>
              <p
                className="text-sm"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--outline)",
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
