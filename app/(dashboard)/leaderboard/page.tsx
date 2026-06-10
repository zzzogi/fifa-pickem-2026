// app/(dashboard)/leaderboard/page.tsx
import { authOptions } from "@/auth";
import LeaderboardTable from "@/components/leaderboard/leaderboard-table";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) redirect("/");

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
          BẢNG XẾP HẠNG
        </h1>
      </div>

      <LeaderboardTable currentUserId={session.user.id} />
    </div>
  );
}
