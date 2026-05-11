export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="bg-[#AF4D98] px-4 pt-8 pb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="h-3 w-28 bg-white/30 rounded mb-2" />
            <div className="h-7 w-36 bg-white/40 rounded mb-3" />
            <div className="h-6 w-24 bg-white/20 rounded-full" />
          </div>
          <div className="w-16 h-16 rounded-full bg-white/20" />
        </div>
      </div>

      <div className="px-4 space-y-6 py-6">
        {/* Section skeleton */}
        {[1, 2, 3].map(i => (
          <div key={i}>
            <div className="h-5 w-32 bg-gray-200 rounded mb-1" />
            <div className="h-3 w-48 bg-[#FDFAF7] rounded mb-4" />
            <div className="space-y-3">
              {[1, 2].map(j => (
                <div key={j} className="bg-white rounded-2xl p-4 border border-[#EBEBEB] shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-4 w-24 bg-gray-200 rounded" />
                    <div className="h-4 w-16 bg-[#FDFAF7] rounded" />
                  </div>
                  <div className="h-3 w-full bg-[#FDFAF7] rounded mb-2" />
                  <div className="h-3 w-3/4 bg-[#FDFAF7] rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
