import { ArrowUpRight, CalendarDays, Megaphone } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Announcement } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatDate, relativeTime } from '@/lib/utils'

export function AnnouncementCard({ announcement, compact = false }: { announcement: Announcement; compact?: boolean }) {
  return (
    <Card className="group h-full transition duration-300 hover:border-brand-200 hover:shadow-soft">
      <CardContent className={compact ? 'p-4' : 'p-5 sm:p-6'}>
        <div className="flex items-start justify-between gap-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
            <Megaphone className="size-5" aria-hidden="true" />
          </span>
          <div className="flex flex-wrap justify-end gap-2">
            {announcement.priority === 'important' && <Badge variant="warning">Important</Badge>}
            <Badge variant="secondary">{announcement.category}</Badge>
          </div>
        </div>
        <Link to={`/announcements/${announcement.id}`} className="focus-ring mt-4 block rounded-sm">
          <h3 className="line-clamp-2 text-lg font-bold leading-snug text-navy-950 transition group-hover:text-brand-700">{announcement.title}</h3>
        </Link>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">{announcement.summary}</p>
        <div className="mt-5 flex items-end justify-between gap-4 border-t pt-4">
          <div>
            <p className="text-xs font-semibold text-navy-800">{announcement.authorName}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><CalendarDays className="size-3" />{formatDate(announcement.publishedAt)} · {relativeTime(announcement.publishedAt)}</p>
          </div>
          <Link to={`/announcements/${announcement.id}`} className="focus-ring rounded-md p-2 text-brand-700 hover:bg-brand-50" aria-label={`Read ${announcement.title}`}>
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
