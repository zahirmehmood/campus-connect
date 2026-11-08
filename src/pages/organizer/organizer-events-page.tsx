import { CalendarDays, Edit3, Eye, FilePlus2, Search, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '@/components/empty-state'
import { LoadingState } from '@/components/loading-state'
import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useAuth } from '@/context/auth-context'
import { useCampusData } from '@/context/data-context'
import { formatDateTime, percent } from '@/lib/utils'

export function OrganizerEventsPage() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const { user } = useAuth()
  const { data, loading } = useCampusData()
  const events = useMemo(() => (data?.events ?? [])
    .filter((event) => event.organizerId === user?.id)
    .filter((event) => status === 'all' || event.status === status)
    .filter((event) => !query.trim() || event.title.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => a.startAt.localeCompare(b.startAt)), [data?.events, query, status, user?.id])

  if (loading) return <LoadingState label="Loading your events…" />

  return (
    <div>
      <PageHeader
        eyebrow="Event operations"
        title="Manage events"
        description="Review publishing status, registration progress, participants, and event details."
        actions={<Button asChild><Link to="/organizer/events/new"><FilePlus2 className="size-4" />Create event</Link></Button>}
      />
      <div className="mb-6 grid gap-3 rounded-xl border bg-white p-4 shadow-card sm:grid-cols-[1fr_220px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input className="pl-10" placeholder="Search your events…" value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
        <Select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="hidden">Hidden</option>
        </Select>
      </div>

      {events.length ? (
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id}>
              <CardContent className="grid gap-5 p-5 md:grid-cols-[160px_1fr_auto] md:items-center">
                <img src={event.imageUrl} alt="" className="h-28 w-full rounded-xl object-cover md:h-24" />
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2">
                    <Badge>{event.category}</Badge>
                    <Badge variant={event.status === 'published' ? 'success' : event.status === 'draft' ? 'secondary' : 'destructive'} className="capitalize">{event.status}</Badge>
                  </div>
                  <h2 className="mt-2 truncate text-lg font-bold text-navy-950">{event.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">{formatDateTime(event.startAt)} · {event.location}</p>
                  <div className="mt-3 max-w-md">
                    <div className="mb-1.5 flex justify-between text-xs text-slate-500"><span>{event.registrationCount} registrations</span><span>{event.capacity} capacity</span></div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand-500" style={{ width: `${percent(event.registrationCount, event.capacity)}%` }} /></div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 md:hidden">
                    <Button asChild variant="outline" size="sm"><Link to={`/events/${event.id}`}><Eye className="size-3.5" />View</Link></Button>
                    <Button asChild variant="outline" size="sm"><Link to={`/organizer/events/${event.id}/participants`}><Users className="size-3.5" />Participants</Link></Button>
                    <Button asChild size="sm"><Link to={`/organizer/events/${event.id}/edit`}><Edit3 className="size-3.5" />Edit</Link></Button>
                  </div>
                </div>
                <div className="hidden flex-col gap-2 md:flex">
                  <Button asChild variant="outline" size="sm"><Link to={`/events/${event.id}`}><Eye className="size-3.5" />View</Link></Button>
                  <Button asChild variant="outline" size="sm"><Link to={`/organizer/events/${event.id}/participants`}><Users className="size-3.5" />Participants</Link></Button>
                  <Button asChild size="sm"><Link to={`/organizer/events/${event.id}/edit`}><Edit3 className="size-3.5" />Edit</Link></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon={CalendarDays} title="No events found" description={query || status !== 'all' ? 'Adjust your filters to find an event.' : 'Create your first event to begin accepting registrations.'} />
      )}
    </div>
  )
}
