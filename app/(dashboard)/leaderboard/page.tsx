// app/(dashboard)/leaderboard/page.tsx
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import LeaderboardTable from "@/components/leaderboard/leaderboard-table";
import LeaderboardLoading from "./loading";
import { getServerSession } from "next-auth";

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/");

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <p
          className="text-xs uppercase tracking-widest mb-1"
          style={{
            color: "var(--outline)",
            fontFamily: "var(--font-body)",
            fontWeight: 700,
          }}
        >
          World Cup 2026
        </p>
        <h1
          className="text-4xl"
          style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}
        >
          LEADERBOARD
        </h1>
      </div>

      <Suspense fallback={<LeaderboardLoading />}>
        <LeaderboardTable currentUserId={session.user.id} />
      </Suspense>
    </div>
  );
}
