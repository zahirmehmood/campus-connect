import type { LucideIcon } from 'lucide-react'
import { ArrowUpRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  hint?: string
  icon: LucideIcon
  tone?: 'blue' | 'violet' | 'emerald' | 'amber'
}

const tones = {
  blue: 'bg-brand-100 text-brand-700',
  violet: 'bg-violet-100 text-violet-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
}

export function StatCard({ label, value, hint, icon: Icon, tone = 'blue' }: StatCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-2 font-display text-3xl font-extrabold text-navy-950">{value}</p>
          </div>
          <span className={cn('grid size-11 place-items-center rounded-xl', tones[tone])}>
            <Icon className="size-5" aria-hidden="true" />
          </span>
        </div>
        {hint && <p className="mt-4 flex items-center gap-1 text-xs font-medium text-slate-500"><ArrowUpRight className="size-3.5 text-emerald-600" />{hint}</p>}
      </CardContent>
    </Card>
  )
}
