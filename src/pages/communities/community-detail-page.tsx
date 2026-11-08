import { ArrowLeft, CalendarDays, CheckCircle2, LoaderCircle, LogIn, Users, UsersRound } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { EmptyState } from '@/components/empty-state'
import { EventCard } from '@/components/event-card'
import { LoadingState } from '@/components/loading-state'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/context/auth-context'
import { useCampusData } from '@/context/data-context'

export function CommunityDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const { user } = useAuth()
  const { data, loading, pending, joinCommunity, leaveCommunity } = useCampusData()
  if (loading) return <LoadingState className="min-h-[65vh]" label="Loading community…" />
  const community = data?.communities.find((candidate) => candidate.id === id && (candidate.status === 'approved' || user?.role === 'admin'))
  if (!community) return <div className="container-shell py-16"><EmptyState title="Community not found" description="This community is not currently available." /></div>
  const joined = data?.memberships.some((item) => item.communityId === community.id && item.userId === user?.id) ?? false
  const members = data?.memberships.filter((item) => item.communityId === community.id).map((membership) => data.users.find((person) => person.id === membership.userId)).filter(Boolean) ?? []
  const events = data?.events.filter((event) => event.communityId === community.id && event.status === 'published').sort((a, b) => a.startAt.localeCompare(b.startAt)) ?? []
  const actionPending = pending === `${joined ? 'leave' : 'join'}:${community.id}`
  const toggle = () => void (joined ? leaveCommunity(community.id) : joinCommunity(community.id)).catch(() => undefined)

  return (
    <section className="pb-16">
      <div className="relative h-72 overflow-hidden sm:h-96"><img src={community.imageUrl} alt="" className="size-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/30 to-transparent" /><div className="container-shell absolute inset-x-0 bottom-0 pb-8 text-white"><Link to="/communities" className="focus-ring mb-5 inline-flex items-center gap-1.5 rounded-md text-sm font-semibold text-white/80 hover:text-white"><ArrowLeft className="size-4" />All communities</Link><Badge className="bg-white/15 text-white backdrop-blur">{community.category}</Badge><h1 className="mt-3 max-w-4xl text-3xl font-extrabold sm:text-5xl">{community.name}</h1></div></div>
      <div className="container-shell grid gap-8 pt-8 lg:grid-cols-[1fr_340px]">
        <div>
          <Card><CardContent className="p-6 sm:p-8"><h2 className="text-2xl font-extrabold text-navy-950">About the community</h2><p className="mt-4 text-lg leading-8 text-slate-600">{community.description}</p><div className="mt-7 flex flex-wrap gap-5 border-t pt-6 text-sm"><span className="flex items-center gap-2 font-semibold text-slate-700"><Users className="size-4 text-brand-600" />{community.memberCount} members</span><span className="flex items-center gap-2 font-semibold text-slate-700"><CalendarDays className="size-4 text-brand-600" />{events.length} upcoming events</span></div></CardContent></Card>
          <div className="mt-8"><div className="mb-5"><p className="text-xs font-bold uppercase tracking-wider text-brand-700">What’s next</p><h2 className="mt-1 text-2xl font-extrabold text-navy-950">Upcoming community events</h2></div>{events.length ? <div className="grid gap-5 md:grid-cols-2">{events.map((event) => <EventCard key={event.id} event={event} registered={data?.registrations.some((item) => item.eventId === event.id && item.userId === user?.id)} compact />)}</div> : <EmptyState icon={CalendarDays} title="No events announced yet" description="Follow this community to hear when its next event is published." />}</div>
          <div className="mt-8"><div className="mb-5"><p className="text-xs font-bold uppercase tracking-wider text-brand-700">People</p><h2 className="mt-1 text-2xl font-extrabold text-navy-950">Community members</h2></div><Card><CardContent className="p-5 sm:p-6"><div className="grid gap-4 sm:grid-cols-2">{members.slice(0, 8).map((member) => member && <div key={member.id} className="flex items-center gap-3 rounded-lg bg-slate-50 p-3"><Avatar src={member.avatarUrl} name={member.fullName} /><div className="min-w-0"><p className="truncate text-sm font-bold text-navy-900">{member.fullName}</p><p className="truncate text-xs text-slate-500">{member.department}</p></div></div>)}</div>{members.length === 0 && <p className="py-5 text-center text-sm text-slate-500">Member directory is empty.</p>}</CardContent></Card></div>
        </div>
        <aside><Card className="sticky top-24 overflow-hidden shadow-soft"><div className="h-1.5 bg-gradient-to-r from-brand-500 to-indigo-500" /><CardContent className="p-6"><span className="grid size-12 place-items-center rounded-xl bg-brand-50 text-brand-700"><UsersRound className="size-6" /></span><h2 className="mt-5 text-xl font-extrabold text-navy-950">{joined ? 'You’re part of this community' : 'Ready to join?'}</h2><p className="mt-2 text-sm leading-relaxed text-slate-600">Connect with members, see society activity, and keep upcoming events close at hand.</p><div className="mt-5 rounded-lg bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Society lead</p><p className="mt-1 font-bold text-navy-900">{community.leaderNames.join(', ')}</p></div>{!user ? <Button asChild size="lg" className="mt-6 w-full"><Link to="/login" state={{ from: location.pathname }}><LogIn className="size-4" />Sign in to join</Link></Button> : user.role === 'student' ? <Button size="lg" className="mt-6 w-full" variant={joined ? 'outline' : 'default'} onClick={toggle} disabled={actionPending}>{actionPending ? <LoaderCircle className="size-4 animate-spin" /> : joined ? <CheckCircle2 className="size-4" /> : <UsersRound className="size-4" />}{actionPending ? 'Updating…' : joined ? 'Leave community' : 'Join community'}</Button> : <Button asChild size="lg" variant="outline" className="mt-6 w-full"><Link to={user.role === 'admin' ? '/admin/communities' : '/organizer'}>Open management view</Link></Button>}</CardContent></Card></aside>
      </div>
    </section>
  )
}
