export default function SavedLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-200 rounded-2xl" />
        <div>
          <div className="h-7 bg-gray-200 rounded-lg w-40 mb-2" />
          <div className="h-5 bg-gray-100 rounded-lg w-28" />
        </div>
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="h-2 bg-gray-200" />
            <div className="p-5 sm:p-6 space-y-4">
              <div className="h-6 bg-gray-100 rounded-lg w-20" />
              <div className="space-y-2">
                <div className="h-5 bg-gray-200 rounded w-full" />
                <div className="h-5 bg-gray-200 rounded w-3/4" />
              </div>
              <div className="space-y-1.5">
                <div className="h-4 bg-gray-100 rounded w-full" />
                <div className="h-4 bg-gray-100 rounded w-5/6" />
              </div>
              <div className="flex gap-4">
                <div className="h-4 bg-gray-100 rounded w-24" />
                <div className="h-4 bg-gray-100 rounded w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
