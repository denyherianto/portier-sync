import { Skeleton } from '@/components/ui/skeleton'

export default function IntegrationsLoading() {
  return (
    <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-9 w-44" />
          <Skeleton className="h-5 w-72" />
        </div>
        <Skeleton className="h-11 w-40 rounded-lg" />
      </div>

      <div className="flex gap-4 mb-6">
        <Skeleton className="h-11 flex-1 rounded-xl" />
        <Skeleton className="h-11 w-36 rounded-xl" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-200 bg-gray-50/50">
          {['Integration', 'Status', 'Last Synced', 'Version'].map(h => (
            <Skeleton key={h} className="h-3.5 w-20 col-span-3" />
          ))}
        </div>
        <div className="divide-y divide-gray-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
              <div className="col-span-4 flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="col-span-3"><Skeleton className="h-6 w-16 rounded-full" /></div>
              <div className="col-span-3"><Skeleton className="h-4 w-24" /></div>
              <div className="col-span-2"><Skeleton className="h-6 w-14 rounded-md" /></div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
