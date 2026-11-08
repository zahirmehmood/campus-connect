import { CalendarCheck2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { EmptyState } from '@/components/empty-state'
import { EventCard } from '@/components/event-card'
import { LoadingState } from '@/components/loading-state'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/auth-context'
import { useCampusData } from '@/context/data-context'

export function MyEventsPage() {
  const { user } = useAuth()
  const { data, loading } = useCampusData()
  const navigate = useNavigate()
  if (!user) return null
  if (loading || !data) return <LoadingState label="Loading your events…" />
  const ids = new Set(data.registrations.filter((item) => item.userId === user.id && item.status === 'registered').map((item) => item.eventId))
  const events = data.events.filter((event) => ids.has(event.id)).sort((a, b) => a.startAt.localeCompare(b.startAt))
  const upcoming = events.filter((event) => new Date(event.endAt) > new Date())

  return <div><PageHeader eyebrow="Your schedule" title="My registered events" description="Everything you have reserved in one place. Open an event to review details or cancel your registration." actions={<Button onClick={() => navigate('/events')}>Explore more events</Button>} />{upcoming.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{upcoming.map((event) => <EventCard key={event.id} event={event} registered />)}</div> : <EmptyState icon={CalendarCheck2} title="No registered events yet" description="Your upcoming registrations will appear here." actionLabel="Browse events" onAction={() => navigate('/events')} />}</div>
}
