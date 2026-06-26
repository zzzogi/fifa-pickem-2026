// components/leaderboard/leaderboard-table.tsx
import { getLeaderboard } from "@/lib/leaderboard";
import { isMobileDevice } from "@/lib/device";
import LeaderboardClient from "./leaderboard-client";

interface LeaderboardTableProps {
  currentUserId: string;
  page: number;
}

export default async function LeaderboardTable({
  currentUserId,
  page,
}: LeaderboardTableProps) {
  const [allEntries, isMobile] = await Promise.all([
    getLeaderboard(),
    isMobileDevice(),
  ]);

  return (
    <LeaderboardClient
      allEntries={allEntries}
      currentUserId={currentUserId}
      isMobile={isMobile}
      initialPage={page}
    />
  );
}
