// components/stats/stats-grid.tsx
import StatCard from "./stat-card";
import type { UserStats } from "@/lib/stats";

export default function StatsGrid({ stats }: { stats: UserStats }) {
  const cards = [
    {
      label: "Tổng Điểm",
      value: stats.totalPoints,
      description: "Điểm nhận được từ các dự đoán chính xác",
      highlight: true,
    },
    {
      label: "Tổng Dự Đoán",
      value: stats.totalPicks,
      description: "Số trận đấu bạn đã dự đoán",
      highlight: false,
    },
    {
      label: "Dự Đoán Đúng",
      value: stats.correctPicks,
      description: "Dự đoán đúng đội thắng hoặc kết quả hòa",
      highlight: false,
    },
    {
      label: "Đúng Tỷ Số",
      value: stats.exactScores,
      description: "Dự đoán chính xác tỷ số (+3 điểm mỗi trận)",
      highlight: false,
    },
    {
      label: "Độ Chính Xác",
      value: stats.totalPicks > 0 ? `${stats.accuracy}%` : "—",
      description:
        stats.totalPicks > 0
          ? `${stats.correctPicks} dự đoán đúng trên tổng ${stats.totalPicks} dự đoán`
          : "Hãy dự đoán một vài trận để xem độ chính xác",
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
