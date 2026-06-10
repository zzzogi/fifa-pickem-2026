import { authOptions } from "@/auth";
import TournamentStatsView from "@/components/stats/tournament-stats";
import { getTournamentStats } from "@/lib/tournament-stats";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function StatsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/");

  const stats = await getTournamentStats();
  return <TournamentStatsView stats={stats} />;
}
