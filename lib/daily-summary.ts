// lib/daily-summary.ts
import prisma from "@/lib/prisma";
import type { DailySummaryEmailData } from "@/lib/email";

const VN_TZ = "Asia/Ho_Chi_Minh";

// Ngày hôm nay theo giờ VN (string YYYY-MM-DD dùng nội bộ để query)
function todayVN(): string {
  // en-CA cho format YYYY-MM-DD — chỉ dùng nội bộ để build Date, không hiển thị
  return new Date().toLocaleDateString("en-CA", { timeZone: VN_TZ });
}

// Start/end of day theo giờ VN → UTC Date để query DB
function startOfDayVN(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00+07:00`);
}

function endOfDayVN(dateStr: string): Date {
  return new Date(`${dateStr}T23:59:59+07:00`);
}

// ─────────────────────────────────────────
// Check xem tất cả trận trong ngày đã FINISHED chưa
// ─────────────────────────────────────────

export async function allMatchesFinishedToday(): Promise<boolean> {
  const today = todayVN();

  const matches = await prisma.match.findMany({
    where: {
      utcDate: {
        gte: startOfDayVN(today),
        lte: endOfDayVN(today),
      },
    },
    select: { status: true },
  });

  // Log ngày VN để debug trên Vercel
  const displayDate = new Date().toLocaleDateString("vi-VN", {
    timeZone: VN_TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  if (matches.length === 0) return false;

  return matches.every((m) => m.status === "FINISHED");
}

// ─────────────────────────────────────────
// Lấy trận tiếp theo sắp diễn ra
// ─────────────────────────────────────────

async function getNextMatch(): Promise<{
  homeTeamName: string | null;
  awayTeamName: string | null;
  utcDate: Date;
} | null> {
  return prisma.match.findFirst({
    where: {
      utcDate: { gt: new Date() },
      status: { in: ["TIMED", "SCHEDULED"] },
    },
    orderBy: { utcDate: "asc" },
    select: {
      homeTeamName: true,
      awayTeamName: true,
      utcDate: true,
    },
  });
}

// ─────────────────────────────────────────
// Build email data cho 1 user
// ─────────────────────────────────────────

export async function buildDailySummaryForUser(
  userId: string,
  userEmail: string,
  userName: string,
  unsubscribeToken: string,
  leaderboard: Array<{
    id: string;
    totalPoints: number;
    name: string | null;
    rank: number;
  }>,
): Promise<DailySummaryEmailData | null> {
  const today = todayVN();

  const todayPicks = await prisma.pick.findMany({
    where: {
      userId,
      scoredAt: { not: null },
      match: {
        utcDate: {
          gte: startOfDayVN(today),
          lte: endOfDayVN(today),
        },
        status: "FINISHED",
      },
    },
    select: {
      isCorrectWinner: true,
      pointsAwarded: true,
    },
  });

  if (todayPicks.length === 0) return null;

  const correctToday = todayPicks.filter((p) => p.isCorrectWinner).length;
  const wrongToday = todayPicks.length - correctToday;
  const pointsToday = todayPicks.reduce((sum, p) => sum + p.pointsAwarded, 0);

  const userEntry = leaderboard.find((u) => u.id === userId);
  if (!userEntry) return null;

  const totalPoints = userEntry.totalPoints;
  const rank = userEntry.rank;

  const top10Entry = leaderboard.find((u) => u.rank === 10);
  const pointsToTop10 =
    rank > 10 && top10Entry ? top10Entry.totalPoints - totalPoints + 1 : null;

  let overtakenByName: string | null = null;
  let overtakenByPoints: number | null = null;

  const userAbove = leaderboard.find((u) => u.rank === rank - 1);
  if (userAbove && pointsToday > 0) {
    const gap = userAbove.totalPoints - totalPoints;
    if (gap <= 20) {
      overtakenByName = userAbove.name ?? "Một người chơi";
      overtakenByPoints = gap + 1;
    }
  }

  const nextMatch = await getNextMatch();
  const nextMatchHoursFromNow = nextMatch
    ? (nextMatch.utcDate.getTime() - Date.now()) / (1000 * 60 * 60)
    : null;

  return {
    to: userEmail,
    userName: userName.split(" ")[0],
    unsubscribeToken,
    correctToday,
    wrongToday,
    pointsToday,
    totalPoints,
    rank,
    pointsToTop10,
    overtakenByName,
    overtakenByPoints,
    nextMatchHome: nextMatch?.homeTeamName ?? null,
    nextMatchAway: nextMatch?.awayTeamName ?? null,
    nextMatchHoursFromNow,
  };
}
