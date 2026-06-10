// components/leaderboard/fire-badge.tsx

interface FireBadgeProps {
  streak: number;
}

// Trả về tier dựa trên streak
function getFireTier(streak: number): {
  emoji: string;
  color: string;
  label: string;
  glow: string;
} | null {
  if (streak < 3) return null;
  if (streak < 5)
    return {
      emoji: "🔥",
      color: "#f97316",
      label: `Chuỗi ${streak}`,
      glow: "rgba(249,115,22,0.4)",
    };
  if (streak < 8)
    return {
      emoji: "🔥🔥",
      color: "#ef4444",
      label: `Chuỗi ${streak} - Huyền thoại 🎖️ `,
      glow: "rgba(239,68,68,0.5)",
    };
  return {
    emoji: "🔥🔥🔥",
    color: "#dc2626",
    label: `Chuỗi ${streak} - Nhà tiên tri 🔮`,
    glow: "rgba(220,38,38,0.6)",
  };
}

export default function FireBadge({ streak }: FireBadgeProps) {
  const tier = getFireTier(streak);
  if (!tier) return null;

  return (
    <span
      className="fire-badge inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-xs font-bold"
      style={{
        background: `${tier.color}22`,
        color: tier.color,
        border: `1px solid ${tier.color}44`,
        fontFamily: "var(--font-body)",
        boxShadow: `0 0 8px ${tier.glow}`,
        animation: "fire-pulse 1.5s ease-in-out infinite",
      }}
    >
      {tier.emoji}
      <span style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem" }}>
        {tier.label}
      </span>
    </span>
  );
}
