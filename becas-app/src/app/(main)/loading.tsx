export default function Loading() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-pulse">
      {/* Hero Skeleton */}
      <div className="rounded-3xl bg-gray-200 h-[280px]" />

      {/* Filters Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <div className="h-7 bg-gray-200 rounded-lg w-48 mb-2" />
          <div className="h-5 bg-gray-100 rounded-lg w-32" />
        </div>
        <div className="h-10 bg-gray-200 rounded-xl w-32" />
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            {/* Top bar */}
            <div className="h-2 bg-gray-200" />
            <div className="p-5 sm:p-6 space-y-4">
              {/* Badge */}
              <div className="h-6 bg-gray-100 rounded-lg w-20" />
              {/* Title */}
              <div className="space-y-2">
                <div className="h-5 bg-gray-200 rounded w-full" />
                <div className="h-5 bg-gray-200 rounded w-3/4" />
              </div>
              {/* Description */}
              <div className="space-y-1.5">
                <div className="h-4 bg-gray-100 rounded w-full" />
                <div className="h-4 bg-gray-100 rounded w-5/6" />
              </div>
              {/* Meta */}
              <div className="flex gap-4">
                <div className="h-4 bg-gray-100 rounded w-24" />
                <div className="h-4 bg-gray-100 rounded w-20" />
              </div>
              {/* CTA */}
              <div className="pt-4 border-t border-gray-100">
                <div className="h-4 bg-gray-100 rounded w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
