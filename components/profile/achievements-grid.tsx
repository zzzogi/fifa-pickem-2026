// components/profile/achievements-grid.tsx
import type { ProfileAchievement } from "@/lib/profile";
import type { AchievementRarity } from "@/lib/achievements";

interface AchievementsGridProps {
  achievements: ProfileAchievement[];
}

// Màu sắc theo rarity — dùng CSS variables để consistent với theme
const rarityConfig: Record<
  AchievementRarity,
  { label: string; border: string; glow: string; badge: string }
> = {
  COMMON: {
    label: "Phổ Thông",
    border: "rgba(255,255,255,0.12)",
    glow: "none",
    badge: "var(--surface-high)",
  },
  RARE: {
    label: "Hiếm",
    border: "rgba(59,130,246,0.5)",
    glow: "0 0 12px rgba(59,130,246,0.2)",
    badge: "rgba(59,130,246,0.15)",
  },
  EPIC: {
    label: "Sử Thi",
    border: "rgba(168,85,247,0.5)",
    glow: "0 0 12px rgba(168,85,247,0.2)",
    badge: "rgba(168,85,247,0.15)",
  },
  LEGENDARY: {
    label: "Huyền Thoại",
    border: "rgba(234,179,8,0.6)",
    glow: "0 0 16px rgba(234,179,8,0.25)",
    badge: "rgba(234,179,8,0.15)",
  },
};

const rarityTextColor: Record<AchievementRarity, string> = {
  COMMON: "var(--outline)",
  RARE: "rgb(147,197,253)",
  EPIC: "rgb(216,180,254)",
  LEGENDARY: "rgb(253,224,71)",
};

function AchievementBadge({
  achievement,
}: {
  achievement: ProfileAchievement;
}) {
  const cfg = rarityConfig[achievement.rarity];
  const textColor = rarityTextColor[achievement.rarity];

  const unlockedDate = new Date(achievement.unlockedAt).toLocaleDateString(
    "vi-VN",
    { day: "numeric", month: "short", year: "numeric" },
  );

  return (
    <div
      title={`${achievement.description} - Mở khoá: ${unlockedDate}`}
      className="flex flex-col items-center gap-2 p-3 rounded-[6px] transition-transform hover:scale-105 cursor-default"
      style={{
        background: "var(--surface)",
        border: `1px solid ${cfg.border}`,
        boxShadow: cfg.glow,
      }}
    >
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
        style={{ background: cfg.badge }}
      >
        {achievement.icon}
      </div>

      {/* Name */}
      <span
        className="text-xs font-bold text-center leading-tight"
        style={{
          fontFamily: "var(--font-body)",
          color: "var(--foreground)",
          maxWidth: "80px",
        }}
      >
        {achievement.name}
      </span>

      {/* Rarity label */}
      <span
        className="text-[10px] uppercase tracking-wider font-bold"
        style={{
          fontFamily: "var(--font-body)",
          color: textColor,
        }}
      >
        {cfg.label}
      </span>
    </div>
  );
}

export default function AchievementsGrid({
  achievements,
}: AchievementsGridProps) {
  if (achievements.length === 0) {
    return (
      <div
        className="text-center py-8 rounded-[6px]"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--outline-variant)",
        }}
      >
        <p
          className="text-sm"
          style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}
        >
          Chưa có thành tích nào được mở khóa.
        </p>
        <p
          className="text-xs mt-1"
          style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}
        >
          Tiếp tục dự đoán để khám phá những bí ẩn! 🔒
        </p>
      </div>
    );
  }

  // Sắp xếp: LEGENDARY → EPIC → RARE → COMMON
  const rarityOrder: AchievementRarity[] = [
    "LEGENDARY",
    "EPIC",
    "RARE",
    "COMMON",
  ];
  const sorted = [...achievements].sort(
    (a, b) => rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity),
  );

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
      {sorted.map((a) => (
        <AchievementBadge key={a.key} achievement={a} />
      ))}
    </div>
  );
}
