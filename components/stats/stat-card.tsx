// components/stats/stat-card.tsx

interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
  highlight?: boolean; // card đặc biệt hơn — dùng cho Total Points
}

export default function StatCard({
  label,
  value,
  description,
  highlight = false,
}: StatCardProps) {
  return (
    <div
      className="card-sports p-5 flex flex-col gap-2 transition-shadow hover:shadow-md"
      style={{
        borderColor: highlight ? "var(--primary)" : undefined,
        borderWidth: highlight ? "2px" : undefined,
      }}
    >
      {/* Label */}
      <p
        className="text-xs uppercase tracking-widest"
        style={{
          fontFamily: "var(--font-body)",
          fontWeight: 700,
          color: highlight ? "var(--primary)" : "var(--outline)",
        }}
      >
        {label}
      </p>

      {/* Value */}
      <p
        className="text-5xl leading-none"
        style={{
          fontFamily: "var(--font-display)",
          letterSpacing: "0.02em",
          color: highlight ? "var(--primary)" : "var(--foreground)",
        }}
      >
        {value}
      </p>

      {/* Description */}
      {description && (
        <p
          className="text-xs mt-1"
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--outline)",
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}
