// lib/scoring.ts

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
  // Exact score — dự đoán đúng cả 2 tỉ số
  const isExactScore =
    predictedHome === actualHome && predictedAway === actualAway;

  if (isExactScore) {
    return { pointsAwarded: 3, isExactScore: true, isCorrectWinner: true };
  }

  // Xác định winner thực tế
  const actualWinner =
    actualHome > actualAway
      ? "HOME"
      : actualAway > actualHome
        ? "AWAY"
        : "DRAW";

  // Xác định winner dự đoán
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
