import { CalendarDays, Clock3, MapPin, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { CampusEvent } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatEventDate, formatTime, percent } from '@/lib/utils'

interface EventCardProps {
  event: CampusEvent
  registered?: boolean
  compact?: boolean
}

export function EventCard({ event, registered = false, compact = false }: EventCardProps) {
  const full = event.registrationCount >= event.capacity
  const spotsLeft = Math.max(0, event.capacity - event.registrationCount)

  return (
    <Card className="group flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-soft">
      <Link to={`/events/${event.id}`} className="focus-ring relative block overflow-hidden rounded-t-xl">
        <div className={compact ? 'h-36' : 'h-44'}>
          <img src={event.imageUrl} alt="" className="size-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/50 via-transparent to-transparent" />
        <Badge className="absolute left-4 top-4 bg-white/95 text-brand-800 shadow-sm">{event.category}</Badge>
        {registered && <Badge variant="success" className="absolute right-4 top-4 shadow-sm">Registered</Badge>}
      </Link>
      <CardContent className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center gap-3 text-xs font-semibold text-brand-700">
          <span className="flex items-center gap-1.5"><CalendarDays className="size-3.5" />{formatEventDate(event.startAt)}</span>
          <span className="flex items-center gap-1.5"><Clock3 className="size-3.5" />{formatTime(event.startAt)}</span>
        </div>
        <Link to={`/events/${event.id}`} className="focus-ring rounded-sm">
          <h3 className="line-clamp-2 text-lg font-bold leading-snug text-navy-950 transition group-hover:text-brand-700">{event.title}</h3>
        </Link>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">{event.description}</p>
        <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
          <MapPin className="size-4 shrink-0" />
          <span className="truncate">{event.location}</span>
        </div>
        <div className="mt-auto pt-5">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium text-slate-500"><Users className="size-3.5" />{event.registrationCount} attending</span>
            <span className={full ? 'font-semibold text-red-600' : 'font-semibold text-slate-600'}>{full ? 'At capacity' : `${spotsLeft} spots left`}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${percent(event.registrationCount, event.capacity)}%` }} />
          </div>
          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <span className="truncate pr-3 text-xs font-medium text-slate-500">By {event.organizerName}</span>
            <Link to={`/events/${event.id}`} className="focus-ring shrink-0 rounded-md text-sm font-bold text-brand-700 hover:text-brand-800">View details</Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
