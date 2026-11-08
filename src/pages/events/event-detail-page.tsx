import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, ExternalLink, LoaderCircle, MapPin, Share2, TicketCheck, Users } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { EmptyState } from '@/components/empty-state'
import { EventCard } from '@/components/event-card'
import { LoadingState } from '@/components/loading-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/context/auth-context'
import { useCampusData } from '@/context/data-context'
import { useToast } from '@/context/toast-context'
import { formatDate, formatTime, percent } from '@/lib/utils'

export function EventDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const { user } = useAuth()
  const { data, loading, pending, registerForEvent, cancelEventRegistration } = useCampusData()
  const { showToast } = useToast()
  if (loading) return <LoadingState className="min-h-[65vh]" label="Loading event…" />

  const event = data?.events.find((candidate) => candidate.id === id && (candidate.status === 'published' || candidate.organizerId === user?.id || user?.role === 'admin'))
  if (!event) return <div className="container-shell py-16"><EmptyState title="Event not found" description="This event may have been unpublished or the link is no longer valid." /></div>

  const registration = data?.registrations.find((item) => item.eventId === event.id && item.userId === user?.id && item.status === 'registered')
  const full = event.registrationCount >= event.capacity
  const related = data?.events.filter((candidate) => candidate.id !== event.id && candidate.status === 'published' && candidate.category === event.category).slice(0, 3) ?? []
  const eventPending = pending === `register:${event.id}` || pending === `cancel:${event.id}`
  const registrationAction = () => {
    const action = registration ? cancelEventRegistration(event.id) : registerForEvent(event.id)
    void action.catch(() => undefined)
  }
  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: event.title, text: event.description, url: window.location.href })
      else { await navigator.clipboard.writeText(window.location.href); showToast({ title: 'Event link copied', tone: 'success' }) }
    } catch { /* User cancelled the native share sheet. */ }
  }

  return (
    <section className="pb-16">
      <div className="relative h-[340px] overflow-hidden sm:h-[430px]">
        <img src={event.imageUrl} alt="" className="size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/35 to-navy-950/10" />
        <div className="container-shell absolute inset-x-0 bottom-0 pb-8 text-white sm:pb-10">
          <Link to="/events" className="focus-ring mb-5 inline-flex items-center gap-1.5 rounded-md text-sm font-semibold text-white/80 hover:text-white"><ArrowLeft className="size-4" />Back to events</Link>
          <div className="flex flex-wrap gap-2"><Badge className="bg-brand-500 text-white">{event.category}</Badge>{event.featured && <Badge className="bg-white/15 text-white backdrop-blur">Featured event</Badge>}{registration && <Badge variant="success"><CheckCircle2 className="mr-1 size-3" />Registered</Badge>}</div>
          <h1 className="mt-4 max-w-4xl text-3xl font-extrabold leading-tight sm:text-5xl">{event.title}</h1>
          <p className="mt-3 text-sm font-semibold text-brand-200">Hosted by {event.organizerName}</p>
        </div>
      </div>
      <div className="container-shell grid gap-8 pt-8 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="grid gap-3 rounded-xl border bg-white p-5 shadow-card sm:grid-cols-3">
            <div className="flex gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700"><CalendarDays className="size-4" /></span><div><p className="text-xs font-semibold text-slate-400">DATE</p><p className="mt-1 text-sm font-bold text-navy-900">{formatDate(event.startAt, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p></div></div>
            <div className="flex gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-lg bg-violet-50 text-violet-700"><Clock3 className="size-4" /></span><div><p className="text-xs font-semibold text-slate-400">TIME</p><p className="mt-1 text-sm font-bold text-navy-900">{formatTime(event.startAt)}–{formatTime(event.endAt)}</p></div></div>
            <div className="flex gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700"><MapPin className="size-4" /></span><div><p className="text-xs font-semibold text-slate-400">LOCATION</p><p className="mt-1 text-sm font-bold text-navy-900">{event.location}</p></div></div>
          </div>
          <div className="mt-8 rounded-xl border bg-white p-6 shadow-card sm:p-8"><h2 className="text-2xl font-extrabold text-navy-950">About this event</h2><p className="mt-4 text-lg leading-relaxed text-slate-600">{event.description}</p><p className="mt-5 whitespace-pre-line leading-8 text-slate-600">{event.details}</p><div className="mt-7 flex flex-wrap gap-2">{event.tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}</div></div>
        </div>
        <aside>
          <Card className="sticky top-24 overflow-hidden shadow-soft"><div className="h-1.5 bg-gradient-to-r from-brand-500 to-indigo-500" /><CardContent className="p-6"><div className="flex items-start justify-between"><div><p className="text-sm font-semibold text-slate-500">Registration</p><p className="mt-1 text-2xl font-extrabold text-navy-950">{full && !registration ? 'Event full' : 'Free'}</p></div><span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-700"><TicketCheck className="size-5" /></span></div><div className="mt-5"><div className="mb-2 flex justify-between text-xs"><span className="flex items-center gap-1 font-medium text-slate-500"><Users className="size-3.5" />{event.registrationCount} registered</span><span className="font-bold text-navy-900">{event.capacity} capacity</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand-500" style={{ width: `${percent(event.registrationCount, event.capacity)}%` }} /></div></div>
          <div className="mt-6">
            {!user ? <Button asChild size="lg" className="w-full"><Link to="/login" state={{ from: location.pathname }}>Sign in to register<ExternalLink className="size-4" /></Link></Button>
              : user.role === 'student' ? <Button size="lg" variant={registration ? 'outline' : 'default'} className="w-full" onClick={registrationAction} disabled={eventPending || (full && !registration)}>{eventPending ? <LoaderCircle className="size-4 animate-spin" /> : registration ? <CheckCircle2 className="size-4" /> : <TicketCheck className="size-4" />}{eventPending ? 'Updating…' : registration ? 'Cancel registration' : full ? 'At capacity' : 'Register now'}</Button>
                : <Button asChild variant="outline" size="lg" className="w-full"><Link to={user.role === 'admin' ? '/admin' : '/organizer'}>Open management dashboard</Link></Button>}
            <Button variant="ghost" className="mt-2 w-full" onClick={() => void share()}><Share2 className="size-4" />Share event</Button>
          </div><p className="mt-5 border-t pt-5 text-center text-xs leading-relaxed text-slate-500">Registration is tied to your student account. You can cancel any time before the event.</p></CardContent></Card>
        </aside>
      </div>
      {related.length > 0 && <div className="container-shell mt-14"><div className="mb-6 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-brand-700">Keep exploring</p><h2 className="mt-1 text-2xl font-extrabold text-navy-950">Similar events</h2></div><Link to="/events" className="text-sm font-bold text-brand-700">See all events</Link></div><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{related.map((item) => <EventCard key={item.id} event={item} registered={data?.registrations.some((registrationItem) => registrationItem.eventId === item.id && registrationItem.userId === user?.id)} />)}</div></div>}
    </section>
  )
}
