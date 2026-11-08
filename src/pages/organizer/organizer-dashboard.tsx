import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CalendarDays, FilePlus2, Megaphone, TicketCheck, TrendingUp, Users, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EmptyState } from '@/components/empty-state'
import { LoadingState } from '@/components/loading-state'
import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/stat-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/context/auth-context'
import { useCampusData } from '@/context/data-context'
import { formatEventDate, percent } from '@/lib/utils'

export function OrganizerDashboard() {
  const { user } = useAuth()
  const { data, loading } = useCampusData()
  if (!user) return null
  if (loading || !data) return <LoadingState label="Preparing organizer analytics…" />
  const events = data.events.filter((event) => event.organizerId === user.id)
  const eventIds = new Set(events.map((event) => event.id))
  const registrations = data.registrations.filter((item) => eventIds.has(item.eventId) && item.status === 'registered')
  const upcoming = events.filter((event) => new Date(event.endAt) > new Date() && event.status === 'published').sort((a, b) => a.startAt.localeCompare(b.startAt))
  const totalCapacity = events.reduce((sum, event) => sum + event.capacity, 0)
  const utilization = percent(registrations.length, totalCapacity)
  const trend = Array.from({ length: 10 }, (_, index) => {
    const day = new Date(); day.setDate(day.getDate() - (9 - index)); day.setHours(0, 0, 0, 0)
    const next = new Date(day); next.setDate(next.getDate() + 1)
    return { day: day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), registrations: registrations.filter((item) => { const value = new Date(item.registeredAt); return value >= day && value < next }).length }
  })
  const participation = events.map((event) => ({ name: event.title.length > 20 ? `${event.title.slice(0, 18)}…` : event.title, registrations: event.registrationCount, capacity: event.capacity })).sort((a, b) => b.registrations - a.registrations).slice(0, 6)

  return (
    <div>
      <PageHeader eyebrow="Organizer workspace" title={`Good to see you, ${user.fullName.split(' ')[0]}`} description="Track participation, manage your event calendar, and keep your communities informed." actions={<><Button asChild variant="outline"><Link to="/organizer/announcements/new"><Megaphone className="size-4" />Publish update</Link></Button><Button asChild><Link to="/organizer/events/new"><FilePlus2 className="size-4" />Create event</Link></Button></>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Events created" value={events.length} hint="All organizer events" icon={CalendarDays} /><StatCard label="Total registrations" value={registrations.length} hint="Active registrations" icon={TicketCheck} tone="violet" /><StatCard label="Upcoming events" value={upcoming.length} hint="Published and scheduled" icon={TrendingUp} tone="emerald" /><StatCard label="Capacity filled" value={`${utilization}%`} hint={`${totalCapacity} total available places`} icon={UsersRound} tone="amber" /></div>
      <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <Card><CardHeader><CardTitle>Registration trend</CardTitle><p className="text-sm text-slate-500">New registrations during the last 10 days</p></CardHeader><CardContent><div className="h-72"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trend} margin={{ left: -20, right: 8 }}><defs><linearGradient id="registrationFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1f75f0" stopOpacity={0.28} /><stop offset="95%" stopColor="#1f75f0" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" /><XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} /><YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ borderRadius: 12, borderColor: '#dbeafe', boxShadow: '0 10px 30px -15px rgba(8,27,60,.3)' }} /><Area type="monotone" dataKey="registrations" stroke="#1f75f0" strokeWidth={3} fill="url(#registrationFill)" /></AreaChart></ResponsiveContainer></div></CardContent></Card>
        <Card><CardHeader><CardTitle>Event participation</CardTitle><p className="text-sm text-slate-500">Registrations compared with capacity</p></CardHeader><CardContent><div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={participation} layout="vertical" margin={{ left: 12, right: 10 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" /><XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} /><YAxis dataKey="name" type="category" width={108} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ borderRadius: 12, borderColor: '#dbeafe' }} /><Bar dataKey="capacity" fill="#e2e8f0" radius={[0, 5, 5, 0]} /><Bar dataKey="registrations" fill="#1f75f0" radius={[0, 5, 5, 0]} /></BarChart></ResponsiveContainer></div></CardContent></Card>
      </div>
      <div className="mt-8"><div className="mb-5 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-brand-700">Next up</p><h2 className="mt-1 text-2xl font-extrabold text-navy-950">Upcoming events</h2></div><Link to="/organizer/events" className="text-sm font-bold text-brand-700">Manage all events</Link></div>{upcoming.length ? <div className="grid gap-4 lg:grid-cols-2">{upcoming.slice(0, 4).map((event) => <Card key={event.id}><CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"><img src={event.imageUrl} alt="" className="h-24 w-full rounded-lg object-cover sm:w-32" /><div className="min-w-0 flex-1"><div className="flex flex-wrap gap-2"><Badge>{event.category}</Badge><Badge variant={event.status === 'published' ? 'success' : 'secondary'} className="capitalize">{event.status}</Badge></div><h3 className="mt-2 truncate font-bold text-navy-950">{event.title}</h3><p className="mt-1 text-xs text-slate-500">{formatEventDate(event.startAt)} · {event.registrationCount}/{event.capacity} registered</p></div><Button asChild variant="outline" size="sm"><Link to={`/organizer/events/${event.id}/participants`}><Users className="size-3.5" />Participants</Link></Button></CardContent></Card>)}</div> : <EmptyState icon={CalendarDays} title="No upcoming events" description="Create an event to start building your community calendar." />}</div>
    </div>
  )
}
