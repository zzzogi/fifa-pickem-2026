// components/leaderboard/fire-badge.tsx

import { Tooltip } from "../tooltip";

interface FireBadgeProps {
  streak: number;
  compact?: boolean;
  isDev?: boolean;
  isBugCatcher?: boolean;
}

function getFireTier(streak: number) {
  if (streak < 3) return null;

  if (streak < 5)
    return {
      emoji: "🔥",
      color: "#f97316",
      label: `Chuỗi ${streak} - Thầy bói đầu làng`,
      glow: "rgba(249,115,22,0.4)",
    };

  if (streak < 8)
    return {
      emoji: "🔥🔥",
      color: "#ef4444",
      label: `Chuỗi ${streak} - Nhà tiên tri`,
      glow: "rgba(239,68,68,0.5)",
    };

  if (streak < 12)
    return {
      emoji: "🔥🔥🔥",
      color: "#dc2626",
      label: `Chuỗi ${streak} - Kèo nào cũng vào`,
      glow: "rgba(220,38,38,0.6)",
    };

  if (streak < 16)
    return {
      emoji: "⚡",
      color: "#eab308",
      label: `Chuỗi ${streak} - CHECK VAR!!!!`,
      glow: "rgba(234,179,8,0.5)",
    };

  if (streak < 20)
    return {
      emoji: "⚡⚡",
      color: "#facc15",
      label: `Chuỗi ${streak} - Chuyên gia đọc vị`,
      glow: "rgba(250,204,21,0.6)",
    };

  if (streak < 25)
    return {
      emoji: "👁️",
      color: "#8b5cf6",
      label: `Chuỗi ${streak} - Cỗ máy thời gian`,
      glow: "rgba(139,92,246,0.6)",
    };

  if (streak < 30)
    return {
      emoji: "🛸",
      color: "#6366f1",
      label: `Chuỗi ${streak} - Người ngoài hành tinh`,
      glow: "rgba(99,102,241,0.6)",
    };

  return {
    emoji: "👑",
    color: "#f59e0b",
    label: `Chuỗi ${streak} - Chủ tịch FIFA`,
    glow: "rgba(245,158,11,0.7)",
  };
}

function AdminBadge() {
  return (
    <Tooltip
      children={
        <span
          className="fire-badge inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-xs font-bold"
          style={{
            background: "#93CAED",
            color: "#292f56",
            border: "1px solid #1e4572",
            fontFamily: "var(--font-body)",
            boxShadow: "0 0 8px #005c8b",
            animation: "fire-pulse 1.5s ease-in-out infinite",
            whiteSpace: "nowrap",
          }}
        >
          💻
          <span
            className="hidden sm:inline"
            style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem" }}
          >
            Admin
          </span>
        </span>
      }
      content={"Người sáng tạo ra trang web"}
    />
  );
}

function BugCatcherBadge() {
  return (
    <Tooltip
      children={
        <span
          className="fire-badge inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-xs font-bold"
          style={{
            background: "#E9967A",
            color: "#8B0000",
            border: "1px solid #B22222",
            fontFamily: "var(--font-body)",
            boxShadow: "0 0 8px #800000",
            animation: "fire-pulse 1.5s ease-in-out infinite",
            whiteSpace: "nowrap",
          }}
        >
          🐞
          <span
            className="hidden sm:inline"
            style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem" }}
          >
            Bug Catcher
          </span>
        </span>
      }
      content={"Người có đóng góp cho việc tìm bug của trang web"}
    />
  );
}

export default function FireBadge({
  streak,
  compact = false,
  isDev = false,
  isBugCatcher = false,
}: FireBadgeProps) {
  const tier = getFireTier(streak);

  const streakBadge = tier ? (
    <span
      className="fire-badge inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-xs font-bold"
      style={{
        background: `${tier.color}22`,
        color: tier.color,
        border: `1px solid ${tier.color}44`,
        fontFamily: "var(--font-body)",
        boxShadow: `0 0 8px ${tier.glow}`,
        animation: "fire-pulse 1.5s ease-in-out infinite",
        whiteSpace: "nowrap",
      }}
    >
      {tier.emoji}
      {compact ? (
        <span
          style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem" }}
        >
          {streak}
        </span>
      ) : (
        <span
          style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem" }}
        >
          {tier.label}
        </span>
      )}
    </span>
  ) : null;

  if (isDev) {
    return (
      <span className="inline-flex items-center gap-1">
        {streakBadge}
        <AdminBadge />
      </span>
    );
  }

  if (isBugCatcher) {
    return (
      <span className="inline-flex items-center gap-1">
        {streakBadge}
        <BugCatcherBadge />
      </span>
    );
  }

  return streakBadge;
}
