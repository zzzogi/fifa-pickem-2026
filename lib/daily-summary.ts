// lib/daily-summary.ts
import prisma from "@/lib/prisma";
import type { DailySummaryEmailData } from "@/lib/email";

// Ngày hôm nay theo UTC (string YYYY-MM-DD)
function todayUTC(): string {
  return new Date().toISOString().split("T")[0];
}

function startOfDayUTC(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

function endOfDayUTC(dateStr: string): Date {
  return new Date(`${dateStr}T23:59:59.999Z`);
}

// ─────────────────────────────────────────
// Check xem tất cả trận trong ngày đã FINISHED chưa
// ─────────────────────────────────────────

export async function allMatchesFinishedToday(): Promise<boolean> {
  const today = todayUTC();

  const matches = await prisma.match.findMany({
    where: {
      utcDate: {
        gte: startOfDayUTC(today),
        lte: endOfDayUTC(today),
      },
    },
    select: { status: true },
  });

  // Không có trận nào hôm nay → không gửi mail
  if (matches.length === 0) return false;

  // Tất cả phải FINISHED
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
  const today = todayUTC();

  // Picks của user trong các trận hôm nay đã được score
  const todayPicks = await prisma.pick.findMany({
    where: {
      userId,
      scoredAt: { not: null },
      match: {
        utcDate: {
          gte: startOfDayUTC(today),
          lte: endOfDayUTC(today),
        },
        status: "FINISHED",
      },
    },
    select: {
      isCorrectWinner: true,
      pointsAwarded: true,
    },
  });

  // User không có picks nào hôm nay → skip
  if (todayPicks.length === 0) return null;

  const correctToday = todayPicks.filter((p) => p.isCorrectWinner).length;
  const wrongToday = todayPicks.length - correctToday;
  const pointsToday = todayPicks.reduce((sum, p) => sum + p.pointsAwarded, 0);

  // Lấy thông tin user từ leaderboard đã tính sẵn
  const userEntry = leaderboard.find((u) => u.id === userId);
  if (!userEntry) return null;

  const totalPoints = userEntry.totalPoints;
  const rank = userEntry.rank;

  // Tính điểm cách top 10
  const top10Entry = leaderboard.find((u) => u.rank === 10);
  const pointsToTop10 =
    rank > 10 && top10Entry ? top10Entry.totalPoints - totalPoints + 1 : null;

  // Tìm user vừa vượt qua (rank ngay trên) — nếu rank thay đổi hôm nay
  // Lấy user có rank = (rank - 1) và totalPoints gần nhất
  let overtakenByName: string | null = null;
  let overtakenByPoints: number | null = null;

  const userAbove = leaderboard.find((u) => u.rank === rank - 1);
  if (userAbove && pointsToday > 0) {
    // Chỉ mention nếu cách biệt nhỏ (≤ 20 điểm) — đủ motivating
    const gap = userAbove.totalPoints - totalPoints;
    if (gap <= 20) {
      overtakenByName = userAbove.name ?? "Một người chơi";
      overtakenByPoints = gap + 1;
    }
  }

  // Next match
  const nextMatch = await getNextMatch();
  const nextMatchHoursFromNow = nextMatch
    ? (nextMatch.utcDate.getTime() - Date.now()) / (1000 * 60 * 60)
    : null;

  return {
    to: userEmail,
    userName: userName.split(" ")[0], // chỉ lấy tên đầu
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
