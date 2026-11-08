import { Link } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BrandLogo({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  return (
    <Link to="/" className="focus-ring inline-flex items-center gap-2.5 rounded-lg" aria-label="CampusConnect home">
      <span className={cn('grid size-9 place-items-center rounded-xl bg-brand-600 text-white shadow-md shadow-brand-600/20', light && 'bg-white text-brand-700')}>
        <GraduationCap className="size-5" aria-hidden="true" />
      </span>
      {!compact && (
        <span className={cn('font-display text-lg font-extrabold tracking-tight text-navy-900', light && 'text-white')}>
          Campus<span className={cn('text-brand-600', light && 'text-brand-300')}>Connect</span>
        </span>
      )}
    </Link>
  )
}
