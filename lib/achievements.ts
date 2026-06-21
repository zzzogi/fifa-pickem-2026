// lib/achievements.ts
import prisma from "@/lib/prisma";

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────

export type AchievementRarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";

export interface AchievementDef {
  key: string;
  name: string;
  description: string;
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
// ─────────────────────────────────────────

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
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
// CHECK CONTEXT
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
    createdAt: Date;
  }[];
}

type CheckFn = (ctx: AchievementCheckContext) => boolean;

const achievementChecks: Record<string, CheckFn> = {
  FIRST_BLOOD: (ctx) => ctx.totalPicks >= 1,
  DEDICATED: (ctx) => ctx.totalPicks >= 20,
  MARATHONER: (ctx) => ctx.totalPicks >= 50,
  SNIPER: (ctx) => ctx.exactScores >= 1,
  TRIPLE_SNIPER: (ctx) => ctx.exactScores >= 3,
  LUCKY_SEVEN: (ctx) => ctx.exactScores >= 7,
  ALL_KNOWING: (ctx) => ctx.exactScores >= 10,
  ON_FIRE: (ctx) => ctx.maxStreak >= 5,
  UNSTOPPABLE: (ctx) => ctx.maxStreak >= 8,
  CENTURY: (ctx) => ctx.totalPoints >= 100,
  TOP_TEN: (ctx) => ctx.rank !== null && ctx.rank <= 10,
  PODIUM: (ctx) => ctx.rank !== null && ctx.rank <= 3,
  COLD_STREAK: (ctx) => {
    const picks = ctx.recentScoredPicks;
    if (picks.length < 5) return false;
    for (let i = 0; i <= picks.length - 5; i++) {
      const window = picks.slice(i, i + 5);
      if (window.every((p) => !p.isCorrectWinner)) return true;
    }
    return false;
  },
  ZERO_ZERO: (ctx) => {
    return ctx.recentScoredPicks.some(
      (p) =>
        p.predictedHomeScore === 0 &&
        p.predictedAwayScore === 0 &&
        p.isExactScore,
    );
  },
  GUTSY: (ctx) => {
    return ctx.recentScoredPicks.some((p) => {
      if (!p.isCorrectWinner) return false;
      const { homeScore, awayScore } = p.match;
      if (homeScore == null || awayScore == null) return false;
      const diff = Math.abs(homeScore - awayScore);
      if (diff < 2) return false;
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
  EARLY_BIRD: (ctx) => {
    return ctx.recentScoredPicks.some((p) => {
      const hoursBeforeKickoff =
        (p.match.utcDate.getTime() - p.createdAt.getTime()) / (1000 * 60 * 60);
      return hoursBeforeKickoff >= 24;
    });
  },
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
  PERFECT_MATCHDAY: (ctx) => {
    const picks = ctx.recentScoredPicks;
    if (picks.length < 3) return false;
    const byDay = new Map<string, typeof picks>();
    for (const p of picks) {
      const day = p.match.utcDate.toISOString().split("T")[0];
      if (!byDay.has(day)) byDay.set(day, []);
      byDay.get(day)!.push(p);
    }
    for (const [, dayPicks] of byDay) {
      if (dayPicks.length >= 3 && dayPicks.every((p) => p.isCorrectWinner))
        return true;
    }
    return false;
  },
};

// ─────────────────────────────────────────
// SINGLE-USER API — vẫn giữ để dùng ở chỗ khác (vd: trigger ngay sau khi
// user submit pick), nhưng KHÔNG dùng trong cron batch vì quá chậm
// ─────────────────────────────────────────

export async function checkAndUnlockAchievements(
  ctx: AchievementCheckContext,
): Promise<string[]> {
  const existing = await prisma.userAchievement.findMany({
    where: { userId: ctx.userId },
    select: { achievement: { select: { key: true } } },
  });
  const existingKeys = new Set(existing.map((e) => e.achievement.key));

  const allAchievements = await prisma.achievement.findMany();
  const achievementByKey = new Map(allAchievements.map((a) => [a.key, a]));

  const newlyUnlocked: string[] = [];

  for (const def of ACHIEVEMENT_DEFS) {
    if (existingKeys.has(def.key)) continue;
    const dbRecord = achievementByKey.get(def.key);
    if (!dbRecord) continue;
    const checkFn = achievementChecks[def.key];
    if (!checkFn) continue;

    if (checkFn(ctx)) {
      await prisma.userAchievement.create({
        data: { userId: ctx.userId, achievementId: dbRecord.id },
      });
      newlyUnlocked.push(def.key);
    }
  }

  return newlyUnlocked;
}

export async function buildAchievementContext(
  userId: string,
): Promise<AchievementCheckContext> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totalPoints: true, currentStreak: true, maxStreak: true },
  });

  const allScoredPicks = await prisma.pick.findMany({
    where: { userId, scoredAt: { not: null } },
    select: {
      isCorrectWinner: true,
      isExactScore: true,
      predictedHomeScore: true,
      predictedAwayScore: true,
      createdAt: true,
      match: { select: { homeScore: true, awayScore: true, utcDate: true } },
    },
    orderBy: { match: { utcDate: "asc" } },
  });

  const totalPicks = allScoredPicks.length;
  const correctPicks = allScoredPicks.filter((p) => p.isCorrectWinner).length;
  const exactScores = allScoredPicks.filter((p) => p.isExactScore).length;

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

// ─────────────────────────────────────────
// BATCH API — dùng trong cron job để check achievements cho NHIỀU user
// chỉ với O(1) query lớn thay vì O(N) query nhỏ
// ─────────────────────────────────────────

export async function buildAchievementContextsBatch(
  userIds: string[],
): Promise<Map<string, AchievementCheckContext>> {
  if (userIds.length === 0) return new Map();

  // 1. Tất cả user info — 1 query
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      totalPoints: true,
      currentStreak: true,
      maxStreak: true,
    },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));

  // 2. Tất cả scored picks của TẤT CẢ user liên quan — 1 query
  const allScoredPicks = await prisma.pick.findMany({
    where: { userId: { in: userIds }, scoredAt: { not: null } },
    select: {
      userId: true,
      isCorrectWinner: true,
      isExactScore: true,
      predictedHomeScore: true,
      predictedAwayScore: true,
      createdAt: true,
      match: { select: { homeScore: true, awayScore: true, utcDate: true } },
    },
    orderBy: { match: { utcDate: "asc" } },
  });

  const picksByUser = new Map<string, typeof allScoredPicks>();
  for (const p of allScoredPicks) {
    if (!picksByUser.has(p.userId)) picksByUser.set(p.userId, []);
    picksByUser.get(p.userId)!.push(p);
  }

  // 3. Rank cho TẤT CẢ user — tính 1 lần dựa trên toàn bộ bảng totalPoints,
  //    thay vì N query count() riêng lẻ
  const allUsersForRank = await prisma.user.findMany({
    select: { id: true, totalPoints: true },
    orderBy: { totalPoints: "desc" },
  });
  const rankMap = new Map<string, number>();
  allUsersForRank.forEach((u, idx) => {
    if (u.totalPoints > 0) rankMap.set(u.id, idx + 1);
  });

  const contexts = new Map<string, AchievementCheckContext>();
  for (const userId of userIds) {
    const user = userMap.get(userId);
    const picks = picksByUser.get(userId) ?? [];
    const totalPicks = picks.length;
    const correctPicks = picks.filter((p) => p.isCorrectWinner).length;
    const exactScores = picks.filter((p) => p.isExactScore).length;

    contexts.set(userId, {
      userId,
      totalPicks,
      correctPicks,
      exactScores,
      currentStreak: user?.currentStreak ?? 0,
      maxStreak: user?.maxStreak ?? 0,
      totalPoints: user?.totalPoints ?? 0,
      rank: rankMap.get(userId) ?? null,
      recentScoredPicks: picks,
    });
  }

  return contexts;
}

export async function checkAndUnlockAchievementsBatch(
  contexts: Map<string, AchievementCheckContext>,
): Promise<Record<string, string[]>> {
  const userIds = [...contexts.keys()];
  if (userIds.length === 0) return {};

  // 1. Tất cả achievements user đã có — 1 query cho TẤT CẢ user
  const existingAll = await prisma.userAchievement.findMany({
    where: { userId: { in: userIds } },
    select: { userId: true, achievement: { select: { key: true } } },
  });
  const existingByUser = new Map<string, Set<string>>();
  for (const e of existingAll) {
    if (!existingByUser.has(e.userId)) existingByUser.set(e.userId, new Set());
    existingByUser.get(e.userId)!.add(e.achievement.key);
  }

  // 2. Toàn bộ achievement records — 1 query
  const allAchievements = await prisma.achievement.findMany();
  const achievementByKey = new Map(allAchievements.map((a) => [a.key, a]));

  // 3. Tính toán newly-unlocked trong memory, rồi ghi 1 lần bằng createMany
  const summary: Record<string, string[]> = {};
  const toCreate: { userId: string; achievementId: string }[] = [];

  for (const userId of userIds) {
    const ctx = contexts.get(userId)!;
    const existingKeys = existingByUser.get(userId) ?? new Set();
    const newlyUnlocked: string[] = [];

    for (const def of ACHIEVEMENT_DEFS) {
      if (existingKeys.has(def.key)) continue;
      const dbRecord = achievementByKey.get(def.key);
      if (!dbRecord) continue;
      const checkFn = achievementChecks[def.key];
      if (!checkFn) continue;

      if (checkFn(ctx)) {
        newlyUnlocked.push(def.key);
        toCreate.push({ userId, achievementId: dbRecord.id });
      }
    }

    if (newlyUnlocked.length > 0) summary[userId] = newlyUnlocked;
  }

  // Ghi tất cả achievement mới trong 1 lần — createMany (Postgres hỗ trợ tốt)
  if (toCreate.length > 0) {
    await prisma.userAchievement.createMany({
      data: toCreate,
      skipDuplicates: true,
    });
  }

  return summary;
}
