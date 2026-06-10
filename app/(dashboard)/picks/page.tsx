// app/(dashboard)/picks/page.tsx
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { getUserSummary } from "@/lib/picks";
import UserSummary from "@/components/picks/user-summary";
import MatchesList from "@/components/picks/matches-list";
import { Suspense } from "react";
import PicksLoading from "./loading";
import { getServerSession } from "next-auth";

export default async function PicksPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/");

  const summary = await getUserSummary(session.user.id);

  return (
    <div>
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
          MY PICKS
        </h1>
      </div>

      <UserSummary
        rank={summary.rank}
        totalPoints={summary.totalPoints}
        accuracy={summary.accuracy}
        correctPicks={summary.correctPicks}
        totalPicks={summary.totalPicks}
      />

      <Suspense fallback={<PicksLoading />}>
        <MatchesList userId={session?.user?.id} />
      </Suspense>
    </div>
  );
}
