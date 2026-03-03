import { Skeleton } from "@/components/ui/skeleton"

export function AppointmentSkeleton() {
  return (
    <div className="bg-white rounded-[2.5rem] border border-primary/5 shadow-sm p-6 animate-pulse">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4 flex-1">
          <Skeleton className="w-14 h-14 rounded-2xl" />
          <div className="flex-1">
            <Skeleton className="h-5 w-40 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Skeleton className="h-12 rounded-2xl" />
        <Skeleton className="h-12 rounded-2xl" />
      </div>

      <Skeleton className="h-16 rounded-2xl mb-4" />
      <Skeleton className="h-10 w-full rounded-2xl" />
    </div>
  )
}

export function AppointmentSkeletonList() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <AppointmentSkeleton key={i} />
      ))}
    </div>
  )
}
