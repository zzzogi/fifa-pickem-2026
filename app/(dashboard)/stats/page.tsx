// app/(dashboard)/stats/page.tsx
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { getUserStats } from "@/lib/stats";
import StatsGrid from "@/components/stats/stats-grid";
import { getServerSession } from "next-auth";

export default async function StatsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/");

  const stats = await getUserStats(session.user.id);

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
          style={{
            fontFamily: "var(--font-display)",
            letterSpacing: "0.02em",
          }}
        >
          MY STATS
        </h1>
      </div>

      {/* Empty state — chưa submit pick nào */}
      {stats.totalPicks === 0 ? (
        <div className="card-sports p-12 text-center">
          <p
            className="text-4xl mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            NO STATS YET
          </p>
          <p
            className="text-sm mb-6"
            style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}
          >
            Head over to Picks and start predicting match scores.
          </p>
          <a
            href="/picks"
            className="inline-block rounded-[4px] px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition hover:opacity-90"
            style={{
              background: "var(--primary)",
              fontFamily: "var(--font-body)",
            }}
          >
            Go to Picks →
          </a>
        </div>
      ) : (
        <StatsGrid stats={stats} />
      )}
    </div>
  );
}
