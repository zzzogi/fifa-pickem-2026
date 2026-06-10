// components/picks/user-summary.tsx

interface UserSummaryProps {
  rank: number | null;
  totalPoints: number;
  accuracy: number;
  correctPicks: number;
  totalPicks: number;
}

export default function UserSummary({
  rank,
  totalPoints,
  accuracy,
  correctPicks,
  totalPicks,
}: UserSummaryProps) {
  const stats = [
    { label: "Xếp hạng", value: rank ? `#${rank}` : "—" },
    { label: "Điểm", value: totalPoints.toString() },
    { label: "Độ chính xác", value: `${accuracy}%` },
    { label: "Đã dự đoán", value: `${correctPicks}/${totalPicks}` },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 mb-6">
      {stats.map((s) => (
        <div key={s.label} className="card-sports p-4">
          <p
            className="text-xs uppercase tracking-widest mb-1"
            style={{
              color: "var(--outline)",
              fontFamily: "var(--font-body)",
              fontWeight: 700,
            }}
          >
            {s.label}
          </p>
          <p
            className="text-2xl leading-none"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {s.value}
          </p>
        </div>
      ))}
    </div>
  );
}
