// components/stats/stats-grid.tsx
import StatCard from "./stat-card";
import type { UserStats } from "@/lib/stats";

export default function StatsGrid({ stats }: { stats: UserStats }) {
  const cards = [
    {
      label: "Total Points",
      value: stats.totalPoints,
      description: "Points earned from correct predictions",
      highlight: true,
    },
    {
      label: "Total Picks",
      value: stats.totalPicks,
      description: "Matches you've predicted",
      highlight: false,
    },
    {
      label: "Correct Picks",
      value: stats.correctPicks,
      description: "Correct winner or draw predictions",
      highlight: false,
    },
    {
      label: "Exact Scores",
      value: stats.exactScores,
      description: "Perfect score predictions (+3 pts each)",
      highlight: false,
    },
    {
      label: "Accuracy",
      value: stats.totalPicks > 0 ? `${stats.accuracy}%` : "—",
      description:
        stats.totalPicks > 0
          ? `${stats.correctPicks} correct out of ${stats.totalPicks} picks`
          : "Make some picks to see your accuracy",
      highlight: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <StatCard
          key={card.label}
          label={card.label}
          value={card.value}
          description={card.description}
          highlight={card.highlight}
        />
      ))}
    </div>
  );
}
