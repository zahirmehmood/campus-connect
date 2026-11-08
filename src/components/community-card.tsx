import { CalendarDays, LoaderCircle, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Community } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface CommunityCardProps {
  community: Community
  joined?: boolean
  upcomingEvents?: number
  canJoin?: boolean
  pending?: boolean
  onToggle?: () => void
}

export function CommunityCard({ community, joined = false, upcomingEvents = 0, canJoin = false, pending = false, onToggle }: CommunityCardProps) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-soft">
      <div className="relative h-40 overflow-hidden">
        <img src={community.imageUrl} alt="" className="size-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/65 via-transparent to-transparent" />
        <Badge className="absolute left-4 top-4 bg-white/95 text-brand-800">{community.category}</Badge>
        {joined && <Badge variant="success" className="absolute right-4 top-4">Joined</Badge>}
      </div>
      <CardContent className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold text-navy-950">{community.name}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">{community.description}</p>
        <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3 text-xs font-medium text-slate-600">
          <span className="flex items-center gap-1.5"><Users className="size-3.5 text-brand-600" />{community.memberCount} members</span>
          <span className="flex items-center gap-1.5"><CalendarDays className="size-3.5 text-brand-600" />{upcomingEvents} upcoming</span>
        </div>
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Society lead</p>
          <p className="mt-1 text-sm font-semibold text-navy-800">{community.leaderNames.join(', ')}</p>
        </div>
        <div className="mt-auto grid gap-2 pt-5 sm:grid-cols-2">
          <Button asChild variant="outline" className={canJoin ? '' : 'sm:col-span-2'}>
            <Link to={`/communities/${community.id}`}>View community</Link>
          </Button>
          {canJoin && onToggle && (
            <Button variant={joined ? 'outline' : 'default'} onClick={onToggle} disabled={pending}>
              {pending && <LoaderCircle className="size-4 animate-spin" />}
              {joined ? 'Leave' : 'Join'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
