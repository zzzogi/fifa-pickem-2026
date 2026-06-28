-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "duration" TEXT,
ADD COLUMN     "penaltyAwayScore" INTEGER,
ADD COLUMN     "penaltyHomeScore" INTEGER;

-- AlterTable
ALTER TABLE "Pick" ADD COLUMN     "isPenaltyExactScore" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPenaltyWinnerCorrect" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "penaltyPointsAwarded" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "predictedPenaltyAwayScore" INTEGER,
ADD COLUMN     "predictedPenaltyHomeScore" INTEGER;
