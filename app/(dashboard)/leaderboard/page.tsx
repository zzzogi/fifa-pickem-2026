// app/(dashboard)/leaderboard/page.tsx
import { authOptions } from "@/auth";
import GuestBlur from "@/components/auth/guest-blur";
import LeaderboardTable from "@/components/leaderboard/leaderboard-table";
import { getLeaderboard } from "@/lib/leaderboard";
import { getServerSession } from "next-auth";

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions);
  const isGuest = !session?.user;
  const entries = await getLeaderboard();

  return (
    <div>
      <div className="mb-6">
        <p
          className="text-xs uppercase tracking-widest mb-1 font-bold"
          style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}
        >
          FIFA World Cup 2026
        </p>
        <h1
          className="text-4xl"
          style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}
        >
          LEADERBOARD
        </h1>
      </div>

      {/* Guest: blur toàn bộ bảng */}
      {isGuest ? (
        <GuestBlur
          title="Sign in to view the Leaderboard"
          description="See how you stack up against other predictors."
        />
      ) : (
        <LeaderboardTable entries={entries} currentUserId={session.user.id} />
      )}
    </div>
  );
}
