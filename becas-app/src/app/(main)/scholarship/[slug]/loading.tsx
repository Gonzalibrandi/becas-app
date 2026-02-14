export default function ScholarshipDetailLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 animate-pulse">
      {/* Hero Skeleton */}
      <div className="bg-gray-300 h-[240px]" />

      {/* Content Skeleton */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-32" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-100 rounded w-full" />
                <div className="h-4 bg-gray-100 rounded w-full" />
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-5/6" />
              </div>
            </div>

            {/* Benefits Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-28" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-gray-200 rounded-full flex-shrink-0" />
                    <div className="h-4 bg-gray-100 rounded flex-1" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <div className="h-4 bg-gray-100 rounded w-24" />
              <div className="h-8 bg-gray-200 rounded w-48" />
              <div className="h-14 bg-gray-300 rounded-xl w-full" />
              <div className="h-12 bg-gray-200 rounded-xl w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
