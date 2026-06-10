import { getTournamentStats } from "@/lib/tournament-stats";
import TournamentStatsView from "@/components/stats/tournament-stats";

export default async function StatsPage() {
  const stats = await getTournamentStats();
  return <TournamentStatsView stats={stats} />;
}
