import { LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function LoadingState({ label = 'Loading CampusConnect…', className }: { label?: string; className?: string }) {
  return (
    <div className={cn('flex min-h-56 flex-col items-center justify-center gap-3 text-slate-500', className)} role="status">
      <LoaderCircle className="size-7 animate-spin text-brand-600" aria-hidden="true" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  )
}

export function CardGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading content">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-xl border bg-white shadow-card">
          <div className="h-44 animate-pulse bg-slate-200" />
          <div className="space-y-3 p-5">
            <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
            <div className="h-6 w-4/5 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  )
}
