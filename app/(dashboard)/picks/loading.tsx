// app/(dashboard)/picks/loading.tsx
export default function PicksLoading() {
  return (
    <div>
      {/* Summary skeleton */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card-sports p-4">
            <div className="skeleton skeleton-text w-16 mb-2" />
            <div className="skeleton h-7 w-10" />
          </div>
        ))}
      </div>

      {/* Match cards skeleton */}
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="card-sports p-4">
            <div className="flex justify-between mb-4">
              <div className="skeleton skeleton-text w-16" />
              <div className="skeleton skeleton-text w-24" />
            </div>
            <div className="grid grid-cols-3 gap-4 items-center">
              <div className="flex flex-col items-center gap-2">
                <div className="skeleton w-12 h-12 rounded-full" />
                <div className="skeleton skeleton-text w-10" />
              </div>
              <div className="skeleton skeleton-text w-8 mx-auto" />
              <div className="flex flex-col items-center gap-2">
                <div className="skeleton w-12 h-12 rounded-full" />
                <div className="skeleton skeleton-text w-10" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
