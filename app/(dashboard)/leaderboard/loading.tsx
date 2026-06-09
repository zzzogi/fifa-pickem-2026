// app/(dashboard)/leaderboard/loading.tsx
export default function LeaderboardLoading() {
  return (
    <div>
      {/* Title skeleton */}
      <div className="mb-6">
        <div className="skeleton skeleton-text w-20 mb-2" />
        <div className="skeleton h-9 w-52" />
      </div>

      {/* Table skeleton */}
      <div className="card-sports overflow-hidden">
        {/* Header */}
        <div className="h-10" style={{ background: "var(--secondary)" }} />
        {/* Rows */}
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-4 py-3 border-b"
            style={{
              borderColor: "var(--outline-variant)",
              background:
                i % 2 === 0 ? "var(--surface-soft)" : "var(--surface)",
            }}
          >
            <div className="skeleton w-8 h-8 rounded-[4px]" />
            <div className="skeleton w-8 h-8 rounded-full" />
            <div className="skeleton skeleton-text flex-1 max-w-[160px]" />
            <div className="skeleton skeleton-text w-8 ml-auto" />
            <div className="skeleton skeleton-text w-10 hidden sm:block" />
            <div className="skeleton skeleton-text w-10 hidden sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
