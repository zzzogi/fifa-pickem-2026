// components/leaderboard/leaderboard-row.tsx
import Image from "next/image";
import FireBadge from "./fire-badge";
import Link from "next/link";

interface LeaderboardRowProps {
  id: string;
  rank: number;
  name: string | null;
  image: string | null;
  totalPoints: number;
  correctPicks: number;
  accuracy: number;
  totalPicks: number;
  currentStreak: number; // ← thêm
  isCurrentUser: boolean;
  isEven: boolean;
}

function RankBadge({ rank }: { rank: number }) {
  const style: Record<number, { bg: string; color: string }> = {
    1: { bg: "#d19900", color: "white" },
    2: { bg: "#8e706c", color: "white" },
    3: { bg: "#964219", color: "white" },
  };
  const s = style[rank];

  return (
    <span
      className="inline-flex items-center justify-center w-8 h-8 rounded-[4px] text-base"
      style={{
        fontFamily: "var(--font-display)",
        background: s ? s.bg : "transparent",
        color: s ? s.color : "var(--outline)",
      }}
    >
      {rank}
    </span>
  );
}

export default function LeaderboardRow({
  id,
  rank,
  name,
  image,
  totalPoints,
  correctPicks,
  accuracy,
  totalPicks,
  currentStreak,
  isCurrentUser,
  isEven,
}: LeaderboardRowProps) {
  return (
    <tr
      style={{
        background: isCurrentUser
          ? "var(--primary-soft)"
          : isEven
            ? "var(--surface-soft)"
            : "var(--surface)",
        borderBottom: "1px solid var(--outline-variant)",
        fontWeight: isCurrentUser ? 700 : 400,
      }}
    >
      {/* Rank */}
      <td className="py-3 pl-4 pr-2 w-12">
        <RankBadge rank={rank} />
      </td>

      {/* Avatar + Name + Fire badge */}
      <td className="py-3 px-2">
        <div className="flex items-center gap-3">
          {image ? (
            <Image
              src={image}
              alt={name ?? "Player"}
              width={32}
              height={32}
              className="rounded-full flex-shrink-0"
              loading="lazy"
            />
          ) : (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{
                background: "var(--surface-muted)",
                color: "var(--outline)",
                fontFamily: "var(--font-body)",
              }}
            >
              {name?.charAt(0).toUpperCase() ?? "?"}
            </div>
          )}

          <div className="flex items-center gap-2 min-w-0">
            <Link
              href={`/profile/${id}`}
              className="flex items-center gap-2 min-w-0 group"
            >
              <span
                className="text-sm truncate max-w-[120px] group-hover:underline"
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: isCurrentUser ? 700 : 400,
                  color: isCurrentUser ? "var(--primary)" : "var(--foreground)",
                }}
              >
                {name ?? "Anonymous"}
                {isCurrentUser && (
                  <span
                    className="ml-1 text-xs uppercase tracking-wide"
                    style={{ color: "var(--outline)" }}
                  >
                    (You)
                  </span>
                )}
              </span>
              <FireBadge streak={currentStreak} />
            </Link>
          </div>
        </div>
      </td>

      {/* Total Points */}
      <td
        className="py-3 px-3 text-right tabular-nums"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.1rem",
          color: isCurrentUser ? "var(--primary)" : "var(--foreground)",
        }}
      >
        {totalPoints}
      </td>

      {/* Correct Picks */}
      <td
        className="py-3 px-3 text-right tabular-nums text-sm hidden sm:table-cell"
        style={{ fontFamily: "var(--font-body)", color: "var(--outline)" }}
      >
        {correctPicks}
      </td>

      {/* Accuracy */}
      <td
        className="py-3 pl-3 pr-4 text-right tabular-nums text-sm hidden sm:table-cell"
        style={{ fontFamily: "var(--font-body)", color: "var(--outline)" }}
      >
        {totalPicks > 0 ? `${accuracy}%` : "—"}
      </td>
    </tr>
  );
}
