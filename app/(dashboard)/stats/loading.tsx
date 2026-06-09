// app/(dashboard)/stats/loading.tsx
export default function StatsLoading() {
  return (
    <div>
      {/* Title skeleton */}
      <div className="mb-6">
        <div className="skeleton skeleton-text w-16 mb-2" />
        <div className="skeleton h-9 w-36" />
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="card-sports p-5">
            <div className="skeleton skeleton-text w-24 mb-3" />
            <div className="skeleton h-12 w-20 mb-2" />
            <div className="skeleton skeleton-text w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}
