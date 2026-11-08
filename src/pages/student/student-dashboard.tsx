import { ArrowRight, Bell, CalendarCheck2, Compass, Megaphone, Sparkles, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AnnouncementCard } from '@/components/announcement-card'
import { EmptyState } from '@/components/empty-state'
import { EventCard } from '@/components/event-card'
import { LoadingState } from '@/components/loading-state'
import { StatCard } from '@/components/stat-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/context/auth-context'
import { useCampusData } from '@/context/data-context'

export function StudentDashboard() {
  const { user } = useAuth()
  const { data, loading } = useCampusData()
  if (!user) return null
  if (loading || !data) return <LoadingState label="Preparing your dashboard…" />

  const registrations = data.registrations.filter((item) => item.userId === user.id && item.status === 'registered')
  const eventIds = new Set(registrations.map((item) => item.eventId))
  const registeredEvents = data.events.filter((event) => eventIds.has(event.id)).sort((a, b) => a.startAt.localeCompare(b.startAt))
  const upcoming = registeredEvents.filter((event) => new Date(event.endAt) > new Date())
  const membershipIds = new Set(data.memberships.filter((item) => item.userId === user.id).map((item) => item.communityId))
  const announcements = data.announcements.filter((item) => item.status === 'published' && (item.scope === 'campus' || (item.communityId && membershipIds.has(item.communityId)))).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
  const recommended = data.events.filter((event) => event.status === 'published' && !eventIds.has(event.id) && (event.category === 'Workshops' || event.tags.some((tag) => user.interests.some((interest) => tag.toLowerCase().includes(interest.toLowerCase().split(' ')[0]))))).slice(0, 2)
  const unread = data.notifications.filter((item) => item.userId === user.id && !item.readAt).length

  return (
    <div>
      <div className="relative mb-8 overflow-hidden rounded-2xl bg-navy-950 p-6 text-white shadow-soft sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(53,149,252,.3),transparent_35%),radial-gradient(circle_at_10%_90%,rgba(99,102,241,.2),transparent_35%)]" />
        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center"><div><Badge className="bg-white/10 text-brand-200"><Sparkles className="mr-1 size-3" />Your campus today</Badge><h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">Welcome back, {user.fullName.split(' ')[0]}.</h1><p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">You have {upcoming.length} upcoming {upcoming.length === 1 ? 'event' : 'events'} and {announcements.length} relevant campus updates.</p></div><Button asChild size="lg" className="shrink-0 bg-white text-navy-950 hover:bg-brand-50"><Link to="/events"><Compass className="size-4" />Discover something new</Link></Button></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Registered events" value={registrations.length} hint="Across your campus journey" icon={CalendarCheck2} /><StatCard label="Joined communities" value={membershipIds.size} hint="Your student network" icon={UsersRound} tone="violet" /><StatCard label="Coming up" value={upcoming.length} hint={upcoming[0] ? `Next: ${upcoming[0].title}` : 'Your calendar is open'} icon={Sparkles} tone="emerald" /><StatCard label="Unread updates" value={unread} hint="Notifications for you" icon={Bell} tone="amber" /></div>
      <div className="mt-8 grid gap-8 xl:grid-cols-[1.45fr_.8fr]">
        <div><div className="mb-5 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-brand-700">Your schedule</p><h2 className="mt-1 text-2xl font-extrabold text-navy-950">Upcoming events</h2></div><Link to="/my-events" className="text-sm font-bold text-brand-700">View all</Link></div>{upcoming.length ? <div className="grid gap-5 md:grid-cols-2">{upcoming.slice(0, 2).map((event) => <EventCard key={event.id} event={event} registered compact />)}</div> : <EmptyState icon={CalendarCheck2} title="Your calendar is ready" description="Explore campus events and register for your first experience." actionLabel="Explore events" onAction={() => window.location.assign('/events')} />}</div>
        <div><div className="mb-5"><p className="text-xs font-bold uppercase tracking-wider text-brand-700">One click away</p><h2 className="mt-1 text-2xl font-extrabold text-navy-950">Quick actions</h2></div><Card><CardContent className="space-y-2 p-3">{[
          { to: '/events', icon: CalendarCheck2, title: 'Find an event', detail: 'Browse what is coming up' },
          { to: '/communities', icon: UsersRound, title: 'Join a community', detail: 'Meet students with shared interests' },
          { to: '/announcements', icon: Megaphone, title: 'Read campus updates', detail: 'Stay ahead of important news' },
        ].map(({ to, icon: Icon, title, detail }) => <Link key={to} to={to} className="focus-ring group flex items-center gap-3 rounded-xl p-3 hover:bg-slate-50"><span className="grid size-10 place-items-center rounded-lg bg-brand-50 text-brand-700"><Icon className="size-4" /></span><div className="min-w-0 flex-1"><p className="text-sm font-bold text-navy-900">{title}</p><p className="truncate text-xs text-slate-500">{detail}</p></div><ArrowRight className="size-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-600" /></Link>)}</CardContent></Card></div>
      </div>
      <div className="mt-10 grid gap-8 xl:grid-cols-[1fr_1fr]">
        <div><div className="mb-5"><p className="text-xs font-bold uppercase tracking-wider text-brand-700">Picked for you</p><h2 className="mt-1 text-2xl font-extrabold text-navy-950">Recommended workshops</h2></div>{recommended.length ? <div className="grid gap-5 sm:grid-cols-2">{recommended.map((event) => <EventCard key={event.id} event={event} compact />)}</div> : <EmptyState title="No recommendations yet" description="Add interests to your profile to improve recommendations." />}</div>
        <div><div className="mb-5 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-brand-700">Your feed</p><h2 className="mt-1 text-2xl font-extrabold text-navy-950">Recent announcements</h2></div><Link to="/announcements" className="text-sm font-bold text-brand-700">View all</Link></div><div className="space-y-4">{announcements.slice(0, 3).map((item) => <AnnouncementCard key={item.id} announcement={item} compact />)}</div></div>
      </div>
    </div>
  )
}
