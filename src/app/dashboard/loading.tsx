export default function DashboardLoading() {
  return (
    <div>
      <div className="mb-8">
        <div className="h-8 w-64 rounded-lg bg-[#ECEFF5] animate-pulse mb-2" />
        <div className="h-5 w-96 rounded-lg bg-[#ECEFF5] animate-pulse" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="portal-card p-5 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-[#ECEFF5] animate-pulse" />
            <div className="h-8 w-20 rounded-lg bg-[#ECEFF5] animate-pulse" />
            <div className="h-4 w-28 rounded-lg bg-[#ECEFF5] animate-pulse" />
            <div className="h-3 w-16 rounded-lg bg-[#ECEFF5] animate-pulse" />
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-5 mb-8">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="portal-card p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#ECEFF5] animate-pulse" />
                <div className="space-y-2">
                  <div className="h-5 w-44 rounded-lg bg-[#ECEFF5] animate-pulse" />
                  <div className="h-4 w-28 rounded-lg bg-[#ECEFF5] animate-pulse" />
                </div>
              </div>
              <div className="h-6 w-20 rounded-full bg-[#ECEFF5] animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-2 w-full rounded-full bg-[#ECEFF5] animate-pulse" />
              <div className="h-2 w-3/4 rounded-full bg-[#ECEFF5] animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
