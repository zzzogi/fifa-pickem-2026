export interface ScoringInput {
  predictedHome: number;
  predictedAway: number;
  actualHome: number;
  actualAway: number;
}

export interface ScoringResult {
  pointsAwarded: number;
  isExactScore: boolean;
  isCorrectWinner: boolean;
}

export function calculatePickScore({
  predictedHome,
  predictedAway,
  actualHome,
  actualAway,
}: ScoringInput): ScoringResult {
  const isExactScore =
    predictedHome === actualHome && predictedAway === actualAway;

  if (isExactScore) {
    return { pointsAwarded: 3, isExactScore: true, isCorrectWinner: true };
  }

  const actualWinner =
    actualHome > actualAway
      ? "HOME"
      : actualAway > actualHome
        ? "AWAY"
        : "DRAW";

  const predictedWinner =
    predictedHome > predictedAway
      ? "HOME"
      : predictedAway > predictedHome
        ? "AWAY"
        : "DRAW";

  const isCorrectWinner = predictedWinner === actualWinner;

  return {
    pointsAwarded: isCorrectWinner ? 1 : 0,
    isExactScore: false,
    isCorrectWinner,
  };
}

// ── Streak bonus ──────────────────────────────────────────
// Streak 3–4:  +1 bonus mỗi pick đúng
// Streak 5–7:  +2 bonus mỗi pick đúng
// Streak 8+:   +3 bonus mỗi pick đúng

export function calculateStreakBonus(streak: number): number {
  if (streak < 3) return 0;
  if (streak < 5) return 1;
  if (streak < 8) return 2;
  return 3;
}

// Trả về streak mới sau 1 pick
export function updateStreak(
  currentStreak: number,
  isCorrectWinner: boolean,
): number {
  return isCorrectWinner ? currentStreak + 1 : 0;
}
