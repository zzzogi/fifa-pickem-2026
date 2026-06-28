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

// ── Penalty shootout scoring ──────────────────────────────
// +1 for correct winner, +2 for exact penalty score, 0 if wrong

export interface PenaltyScoringInput {
  predictedPenaltyHome: number;
  predictedPenaltyAway: number;
  actualPenaltyHome: number;
  actualPenaltyAway: number;
}

export interface PenaltyScoringResult {
  penaltyPointsAwarded: number;
  isPenaltyWinnerCorrect: boolean;
  isPenaltyExactScore: boolean;
}

export function calculatePenaltyScore({
  predictedPenaltyHome,
  predictedPenaltyAway,
  actualPenaltyHome,
  actualPenaltyAway,
}: PenaltyScoringInput): PenaltyScoringResult {
  const isExact =
    predictedPenaltyHome === actualPenaltyHome &&
    predictedPenaltyAway === actualPenaltyAway;

  const actualWinner =
    actualPenaltyHome > actualPenaltyAway ? "HOME" : "AWAY";
  const predictedWinner =
    predictedPenaltyHome > predictedPenaltyAway ? "HOME" : "AWAY";
  const isWinnerCorrect = predictedWinner === actualWinner;

  return {
    penaltyPointsAwarded: isExact ? 2 : isWinnerCorrect ? 1 : 0,
    isPenaltyWinnerCorrect: isWinnerCorrect,
    isPenaltyExactScore: isExact,
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
