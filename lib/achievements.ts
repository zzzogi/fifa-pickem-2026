// lib/achievements.ts
import prisma from "@/lib/prisma";

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────

export type AchievementRarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";

export interface AchievementDef {
  key: string;
  name: string; // Tên hiển thị khi unlock
  description: string; // Mô tả ngắn khi unlock (không tiết lộ điều kiện)
  icon: string;
  rarity: AchievementRarity;
}

export interface UserAchievementWithDef {
  id: string;
  unlockedAt: Date;
  achievement: AchievementDef & { id: string };
}

// ─────────────────────────────────────────
// ACHIEVEMENT DEFINITIONS
// Điều kiện bí mật — không expose ra ngoài
// ─────────────────────────────────────────

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  // ── COMMON ───────────────────────────────
  {
    key: "FIRST_BLOOD",
    name: "Bước Khởi Đầu",
    description: "Chào mừng bạn đến với Pick'em!",
    icon: "⚽",
    rarity: "COMMON",
  },
  {
    key: "DEDICATED",
    name: "Nhiệt Huyết",
    description: "Bạn đang dần trở thành một fan cứng.",
    icon: "📋",
    rarity: "COMMON",
  },
  {
    key: "EARLY_BIRD",
    name: "Chim Sâu",
    description: "Ai dậy sớm thì... dự đoán sớm.",
    icon: "🌅",
    rarity: "COMMON",
  },
  {
    key: "COLD_STREAK",
    name: "Vận Đen",
    description: "Đôi khi bóng đá không như mình nghĩ.",
    icon: "🥶",
    rarity: "COMMON",
  },

  // ── RARE ─────────────────────────────────
  {
    key: "SNIPER",
    name: "Bắn Tỉa",
    description: "Tỉ số chính xác như súng bắn tỉa.",
    icon: "🎯",
    rarity: "RARE",
  },
  {
    key: "ON_FIRE",
    name: "Bốc Lửa",
    description: "Chuỗi dự đoán đúng liên tiếp ấn tượng!",
    icon: "🔥",
    rarity: "RARE",
  },
  {
    key: "MARATHONER",
    name: "Chạy Đường Dài",
    description: "Kiên trì là chìa khóa của thành công.",
    icon: "🏃",
    rarity: "RARE",
  },
  {
    key: "CENTURY",
    name: "Thế Kỷ",
    description: "Cột mốc 3 chữ số đầu tiên.",
    icon: "💯",
    rarity: "RARE",
  },
  {
    key: "GUTSY",
    name: "Liều Lĩnh",
    description: "Bạn tin tưởng vào điều không ai ngờ tới.",
    icon: "🦁",
    rarity: "RARE",
  },

  // ── EPIC ─────────────────────────────────
  {
    key: "TRIPLE_SNIPER",
    name: "Xạ Thủ Tinh Nhuệ",
    description: "Ba lần đúng tỉ số chính xác. Không phải may mắn.",
    icon: "🏹",
    rarity: "EPIC",
  },
  {
    key: "UNSTOPPABLE",
    name: "Không Thể Ngăn Cản",
    description: "Streak của bạn đang ở một tầm cao mới.",
    icon: "⚡",
    rarity: "EPIC",
  },
  {
    key: "COMEBACK_KID",
    name: "Hồi Sinh",
    description: "Ngã rồi đứng lên, và đứng lên thật mạnh.",
    icon: "🦅",
    rarity: "EPIC",
  },
  {
    key: "ZERO_ZERO",
    name: "Mưa Không Rơi",
    description: "Dự đoán trận không có bàn thắng và đúng.",
    icon: "🧱",
    rarity: "EPIC",
  },
  {
    key: "PERFECT_MATCHDAY",
    name: "Ngày Hoàn Hảo",
    description: "Tất cả dự đoán trong ngày đều chính xác.",
    icon: "✨",
    rarity: "EPIC",
  },
  {
    key: "TOP_TEN",
    name: "Top 10",
    description: "Bạn đã lọt vào nhóm elite.",
    icon: "🏅",
    rarity: "EPIC",
  },

  // ── LEGENDARY ────────────────────────────
  {
    key: "LUCKY_SEVEN",
    name: "Số May Mắn",
    description: "7 lần đúng tỉ số chính xác. Huyền thoại.",
    icon: "🌟",
    rarity: "LEGENDARY",
  },
  {
    key: "PODIUM",
    name: "Podium",
    description: "Top 3 bảng xếp hạng. Bạn là huyền thoại.",
    icon: "🏆",
    rarity: "LEGENDARY",
  },
  {
    key: "ALL_KNOWING",
    name: "Tiên Tri",
    description: "Đúng tỉ số 10 lần. Bạn có phép màu gì vậy?",
    icon: "🔮",
    rarity: "LEGENDARY",
  },
];

// ─────────────────────────────────────────
// CHECK CONTEXT — data cần thiết để check achievements
// ─────────────────────────────────────────

export interface AchievementCheckContext {
  userId: string;
  totalPicks: number;
  correctPicks: number;
  exactScores: number;
  currentStreak: number;
  maxStreak: number;
  totalPoints: number;
  rank: number | null;
  // Picks đã được score trong lần này (để check matchday, comeback, v.v.)
  recentScoredPicks: {
    isCorrectWinner: boolean;
    isExactScore: boolean;
    predictedHomeScore: number;
    predictedAwayScore: number;
    match: {
      homeScore: number | null;
      awayScore: number | null;
      utcDate: Date;
    };
    createdAt: Date; // thời điểm submit pick
  }[];
}

// ─────────────────────────────────────────
// CHECK FUNCTIONS — mỗi achievement một function
// ─────────────────────────────────────────

type CheckFn = (ctx: AchievementCheckContext) => boolean;

const achievementChecks: Record<string, CheckFn> = {
  // Dự đoán đầu tiên
  FIRST_BLOOD: (ctx) => ctx.totalPicks >= 1,

  // Submit 20 picks tổng
  DEDICATED: (ctx) => ctx.totalPicks >= 20,

  // Submit 50 picks tổng
  MARATHONER: (ctx) => ctx.totalPicks >= 50,

  // Đúng tỉ số chính xác lần đầu
  SNIPER: (ctx) => ctx.exactScores >= 1,

  // Đúng tỉ số chính xác 3 lần
  TRIPLE_SNIPER: (ctx) => ctx.exactScores >= 3,

  // Đúng tỉ số chính xác 7 lần
  LUCKY_SEVEN: (ctx) => ctx.exactScores >= 7,

  // Đúng tỉ số chính xác 10 lần
  ALL_KNOWING: (ctx) => ctx.exactScores >= 10,

  // Streak 5 đúng liên tiếp
  ON_FIRE: (ctx) => ctx.maxStreak >= 5,

  // Streak 8+ đúng liên tiếp
  UNSTOPPABLE: (ctx) => ctx.maxStreak >= 8,

  // Đạt 100 điểm tổng
  CENTURY: (ctx) => ctx.totalPoints >= 100,

  // Top 10 leaderboard
  TOP_TEN: (ctx) => ctx.rank !== null && ctx.rank <= 10,

  // Top 3 leaderboard
  PODIUM: (ctx) => ctx.rank !== null && ctx.rank <= 3,

  // 5 sai liên tiếp — check trong recent picks
  COLD_STREAK: (ctx) => {
    const picks = ctx.recentScoredPicks;
    if (picks.length < 5) return false;
    // Check xem có đoạn 5 picks sai liên tiếp không
    for (let i = 0; i <= picks.length - 5; i++) {
      const window = picks.slice(i, i + 5);
      if (window.every((p) => !p.isCorrectWinner)) return true;
    }
    return false;
  },

  // Predict 0-0 và đúng
  ZERO_ZERO: (ctx) => {
    return ctx.recentScoredPicks.some(
      (p) =>
        p.predictedHomeScore === 0 &&
        p.predictedAwayScore === 0 &&
        p.isExactScore,
    );
  },

  // Predict thắng đội underdog (thua >= 2 bàn so với kết quả thực) mà lại đúng
  GUTSY: (ctx) => {
    return ctx.recentScoredPicks.some((p) => {
      if (!p.isCorrectWinner) return false;
      const { homeScore, awayScore } = p.match;
      if (homeScore == null || awayScore == null) return false;
      const diff = Math.abs(homeScore - awayScore);
      if (diff < 2) return false;
      // Kiểm tra user predict đúng đội thắng với cách biệt lớn
      const predictedWinner =
        p.predictedHomeScore > p.predictedAwayScore
          ? "HOME"
          : p.predictedAwayScore > p.predictedHomeScore
            ? "AWAY"
            : "DRAW";
      const actualWinner =
        homeScore > awayScore
          ? "HOME"
          : awayScore > homeScore
            ? "AWAY"
            : "DRAW";
      return predictedWinner === actualWinner;
    });
  },

  // Submit pick trước 24h kick-off
  EARLY_BIRD: (ctx) => {
    return ctx.recentScoredPicks.some((p) => {
      const hoursBeforeKickoff =
        (p.match.utcDate.getTime() - p.createdAt.getTime()) / (1000 * 60 * 60);
      return hoursBeforeKickoff >= 24;
    });
  },

  // Sau 3 sai liên tiếp, đúng 3 liên tiếp
  COMEBACK_KID: (ctx) => {
    const picks = ctx.recentScoredPicks;
    if (picks.length < 6) return false;
    for (let i = 0; i <= picks.length - 6; i++) {
      const wrong3 = picks.slice(i, i + 3).every((p) => !p.isCorrectWinner);
      const right3 = picks.slice(i + 3, i + 6).every((p) => p.isCorrectWinner);
      if (wrong3 && right3) return true;
    }
    return false;
  },

  // Tất cả picks trong 1 ngày đều đúng (tối thiểu 3 picks)
  PERFECT_MATCHDAY: (ctx) => {
    const picks = ctx.recentScoredPicks;
    if (picks.length < 3) return false;

    // Group picks theo ngày UTC của trận đấu
    const byDay = new Map<string, typeof picks>();
    for (const p of picks) {
      const day = p.match.utcDate.toISOString().split("T")[0];
      if (!byDay.has(day)) byDay.set(day, []);
      byDay.get(day)!.push(p);
    }

    for (const [, dayPicks] of byDay) {
      if (dayPicks.length >= 3 && dayPicks.every((p) => p.isCorrectWinner)) {
        return true;
      }
    }
    return false;
  },
};

// ─────────────────────────────────────────
// MAIN: Check & unlock achievements cho 1 user
// Trả về danh sách keys vừa unlock (để notify)
// ─────────────────────────────────────────

export async function checkAndUnlockAchievements(
  ctx: AchievementCheckContext,
): Promise<string[]> {
  // Lấy achievements user đã có
  const existing = await prisma.userAchievement.findMany({
    where: { userId: ctx.userId },
    select: { achievement: { select: { key: true } } },
  });
  const existingKeys = new Set(existing.map((e) => e.achievement.key));

  // Lấy tất cả achievement records từ DB
  const allAchievements = await prisma.achievement.findMany();
  const achievementByKey = new Map(allAchievements.map((a) => [a.key, a]));

  const newlyUnlocked: string[] = [];

  for (const def of ACHIEVEMENT_DEFS) {
    // Bỏ qua nếu đã có
    if (existingKeys.has(def.key)) continue;

    // Bỏ qua nếu chưa có trong DB (chưa seed)
    const dbRecord = achievementByKey.get(def.key);
    if (!dbRecord) continue;

    // Check điều kiện
    const checkFn = achievementChecks[def.key];
    if (!checkFn) continue;

    if (checkFn(ctx)) {
      await prisma.userAchievement.create({
        data: {
          userId: ctx.userId,
          achievementId: dbRecord.id,
        },
      });
      newlyUnlocked.push(def.key);
    }
  }

  return newlyUnlocked;
}

// ─────────────────────────────────────────
// HELPER: Build context từ userId
// Dùng trong cron sau khi đã score xong
// ─────────────────────────────────────────

export async function buildAchievementContext(
  userId: string,
): Promise<AchievementCheckContext> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      totalPoints: true,
      currentStreak: true,
      maxStreak: true,
    },
  });

  // Tất cả picks đã được score (có scoredAt)
  const allScoredPicks = await prisma.pick.findMany({
    where: { userId, scoredAt: { not: null } },
    select: {
      isCorrectWinner: true,
      isExactScore: true,
      predictedHomeScore: true,
      predictedAwayScore: true,
      createdAt: true,
      match: {
        select: {
          homeScore: true,
          awayScore: true,
          utcDate: true,
        },
      },
    },
    orderBy: { match: { utcDate: "asc" } },
  });

  const totalPicks = allScoredPicks.length;
  const correctPicks = allScoredPicks.filter((p) => p.isCorrectWinner).length;
  const exactScores = allScoredPicks.filter((p) => p.isExactScore).length;

  // Tính rank
  const rank =
    (user?.totalPoints ?? 0) > 0
      ? (await prisma.user.count({
          where: { totalPoints: { gt: user!.totalPoints } },
        })) + 1
      : null;

  return {
    userId,
    totalPicks,
    correctPicks,
    exactScores,
    currentStreak: user?.currentStreak ?? 0,
    maxStreak: user?.maxStreak ?? 0,
    totalPoints: user?.totalPoints ?? 0,
    rank,
    recentScoredPicks: allScoredPicks,
  };
}
