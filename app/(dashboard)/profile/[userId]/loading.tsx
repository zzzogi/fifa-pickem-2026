// app/(dashboard)/profile/[userId]/loading.tsx
export default function ProfileLoading() {
  return (
    <div>
      {/* Header skeleton */}
      <div className="card-sports p-6 mb-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="skeleton w-[72px] h-[72px] rounded-full flex-shrink-0" />
          <div className="flex-1">
            <div className="skeleton h-7 w-40 mb-2" />
            <div className="skeleton skeleton-text w-24" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="p-3 rounded-[4px]"
              style={{ background: "var(--surface-soft)" }}
            >
              <div className="skeleton skeleton-text w-12 mx-auto mb-2" />
              <div className="skeleton h-6 w-8 mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Picks skeleton */}
      <div
        className="card-sports divide-y"
        style={{ borderColor: "var(--outline-variant)" }}
      >
        {[...Array(5)].map((_, i) => (
          <div key={i} className="px-4 py-3 flex items-center gap-3">
            <div className="skeleton w-6 h-6 rounded-full" />
            <div className="skeleton skeleton-text w-8" />
            <div className="skeleton skeleton-text w-16 flex-1" />
            <div className="skeleton skeleton-text w-20 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
