function Pulse({ className }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
  )
}

export function SkeletonTechnicianCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-3">
      <div className="flex items-start gap-3">
        <Pulse className="h-14 w-14 rounded-xl flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex justify-between">
            <Pulse className="h-4 w-32 rounded-lg" />
            <Pulse className="h-5 w-16 rounded-full" />
          </div>
          <Pulse className="h-4 w-24 rounded-lg" />
          <Pulse className="h-3 w-20 rounded-lg" />
          <div className="flex justify-between">
            <Pulse className="h-3 w-16 rounded-lg" />
            <Pulse className="h-3 w-20 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function SkeletonCompanyCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <Pulse className="w-full h-36 rounded-none" />
      <div className="p-3.5 space-y-2">
        <Pulse className="h-4 w-36 rounded-lg" />
        <Pulse className="h-3 w-24 rounded-lg" />
        <Pulse className="h-3 w-28 rounded-lg" />
        <div className="flex gap-2 pt-1">
          <Pulse className="h-8 flex-1 rounded-xl" />
          <Pulse className="h-8 flex-1 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonProfileHeader() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Pulse className="h-16 w-16 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Pulse className="h-5 w-40 rounded-lg" />
          <Pulse className="h-4 w-24 rounded-full" />
          <Pulse className="h-3 w-32 rounded-lg" />
        </div>
      </div>
      <div className="flex gap-2">
        <Pulse className="h-11 flex-1 rounded-2xl" />
        <Pulse className="h-11 flex-1 rounded-2xl" />
      </div>
    </div>
  )
}

export function SkeletonListCards({ count = 4 }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonTechnicianCard key={i} />
      ))}
    </div>
  )
}

export function SkeletonRecentCard() {
  return (
    <div className="w-36 flex-shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <Pulse className="w-full h-24 rounded-none" />
      <div className="p-2.5 space-y-1.5">
        <Pulse className="h-3 w-20 rounded-lg" />
        <Pulse className="h-3 w-14 rounded-lg" />
      </div>
    </div>
  )
}
