// components/leaderboard/leaderboard-table.tsx
import { getLeaderboard } from "@/lib/leaderboard";
import LeaderboardRow from "./leaderboard-row";

interface LeaderboardTableProps {
  currentUserId: string;
}

export default async function LeaderboardTable({
  currentUserId,
}: LeaderboardTableProps) {
  const entries = await getLeaderboard();

  if (entries.length === 0) {
    return (
      <div className="card-sports p-12 text-center">
        <p
          className="text-4xl mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          NO PLAYERS YET
        </p>
        <p style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}>
          Be the first to make picks and claim the top spot.
        </p>
      </div>
    );
  }

  const headerCells = [
    { label: "#", className: "pl-4 pr-2 w-12" },
    { label: "Player", className: "px-2" },
    { label: "Points", className: "px-3 text-right" },
    { label: "Correct", className: "px-3 text-right hidden sm:table-cell" },
    {
      label: "Accuracy",
      className: "pl-3 pr-4 text-right hidden sm:table-cell",
    },
  ];

  return (
    <div className="card-sports overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Header */}
          <thead>
            <tr
              style={{
                background: "var(--secondary)",
                borderBottom: "2px solid var(--primary)",
              }}
            >
              {headerCells.map((cell) => (
                <th
                  key={cell.label}
                  className={`py-3 text-xs uppercase tracking-widest font-bold text-white ${cell.className}`}
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {cell.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {entries.map((entry, index) => (
              <LeaderboardRow
                key={entry.id}
                id={entry.id}
                rank={entry.rank}
                name={entry.name}
                image={entry.image}
                totalPoints={entry.totalPoints}
                correctPicks={entry.correctPicks}
                accuracy={entry.accuracy}
                totalPicks={entry.totalPicks}
                currentStreak={entry.currentStreak} // ← thêm dòng này
                isCurrentUser={entry.id === currentUserId}
                isEven={index % 2 === 0}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer: current user rank nếu không nằm trong top visible */}
      <CurrentUserFooter entries={entries} currentUserId={currentUserId} />
    </div>
  );
}

// Footer hiện rank của current user khi scroll xuống xa
function CurrentUserFooter({
  entries,
  currentUserId,
}: {
  entries: Awaited<ReturnType<typeof getLeaderboard>>;
  currentUserId: string;
}) {
  const me = entries.find((e) => e.id === currentUserId);
  if (!me) return null;

  // Chỉ hiện nếu rank > 10 (user nằm xa top)
  if (me.rank <= 10) return null;

  return (
    <div
      className="border-t-2 px-4 py-3 flex items-center justify-between"
      style={{
        borderColor: "var(--primary)",
        background: "var(--primary-soft)",
      }}
    >
      <span
        className="text-sm uppercase tracking-wide"
        style={{ fontFamily: "var(--font-body)", fontWeight: 700 }}
      >
        Your rank
      </span>
      <div
        className="flex items-center gap-6 tabular-nums text-sm"
        style={{ fontFamily: "var(--font-body)" }}
      >
        <span>
          <strong
            style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem" }}
          >
            #{me.rank}
          </strong>
        </span>
        <span style={{ color: "var(--outline)" }}>{me.totalPoints} pts</span>
        <span style={{ color: "var(--outline)" }}>{me.accuracy}% accuracy</span>
      </div>
    </div>
  );
}
