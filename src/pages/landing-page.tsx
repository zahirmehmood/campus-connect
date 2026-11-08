import { ArrowRight, CalendarCheck2, CheckCircle2, Compass, GraduationCap, ShieldCheck, Sparkles, UsersRound, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AnnouncementCard } from '@/components/announcement-card'
import { CommunityCard } from '@/components/community-card'
import { EventCard } from '@/components/event-card'
import { CardGridSkeleton } from '@/components/loading-state'
import { SectionHeading } from '@/components/section-heading'
import { Button } from '@/components/ui/button'
import { useCampusData } from '@/context/data-context'

export function LandingPage() {
  const { data, loading } = useCampusData()
  const events = data?.events.filter((event) => event.status === 'published').sort((a, b) => a.startAt.localeCompare(b.startAt)) ?? []
  const communities = data?.communities.filter((community) => community.status === 'approved') ?? []
  const announcements = data?.announcements.filter((item) => item.status === 'published').sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)) ?? []

  return (
    <>
      <section className="relative isolate overflow-hidden bg-white">
        <div className="absolute inset-x-0 top-0 -z-10 h-[680px] bg-[radial-gradient(circle_at_15%_15%,rgba(53,149,252,0.14),transparent_34%),radial-gradient(circle_at_85%_20%,rgba(99,102,241,0.11),transparent_30%)]" />
        <div className="container-shell grid min-h-[680px] items-center gap-12 py-16 lg:grid-cols-[1.05fr_.95fr] lg:py-20">
          <div className="animate-fade-up">
            <div className="eyebrow"><Sparkles className="size-3.5" />The smarter way to do campus life</div>
            <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.08] text-navy-950 sm:text-5xl lg:text-6xl">Your Campus.<br /><span className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">Your Community.</span><br />Your Opportunities.</h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">Discover the events worth attending, find communities where you belong, and never miss an opportunity that can shape your university experience.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg"><Link to="/events"><Compass className="size-5" />Explore events<ArrowRight className="size-4" /></Link></Button>
              <Button asChild variant="outline" size="lg"><Link to="/register">Join CampusConnect</Link></Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-600">
              {['One trusted campus feed', 'Student-led communities', 'Free to join'].map((text) => <span key={text} className="flex items-center gap-2"><CheckCircle2 className="size-4 text-emerald-600" />{text}</span>)}
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-xl lg:mx-0">
            <div className="absolute -inset-5 -z-10 rounded-[2rem] bg-gradient-to-br from-brand-200/60 via-indigo-100/50 to-cyan-100/50 blur-2xl" />
            <div className="overflow-hidden rounded-[1.75rem] border-8 border-white bg-white shadow-[0_30px_80px_-30px_rgba(8,27,60,.45)]">
              <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=88" alt="University students collaborating on campus" className="h-[440px] w-full object-cover" />
              <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/60 bg-white/90 p-4 shadow-soft backdrop-blur-xl sm:left-10 sm:right-auto sm:w-72">
                <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-brand-600 text-white"><CalendarCheck2 className="size-5" /></span><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Next on campus</p><p className="font-bold text-navy-950">Cloud Launch Lab</p></div></div>
                <div className="mt-3 flex items-center justify-between border-t pt-3 text-xs"><span className="text-slate-500">Innovation Lab · 5:30 PM</span><span className="font-bold text-emerald-700">Spots open</span></div>
              </div>
            </div>
            <div className="absolute -right-4 top-8 hidden rounded-2xl border bg-white p-4 shadow-soft sm:block">
              <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-lg bg-violet-100 text-violet-700"><UsersRound className="size-4" /></span><div><p className="text-xs text-slate-500">Active communities</p><p className="text-lg font-extrabold text-navy-950">6+</p></div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y bg-navy-950 py-7 text-white">
        <div className="container-shell grid grid-cols-2 gap-6 text-center lg:grid-cols-4">
          {[['20+', 'Demo students'], ['10', 'Upcoming events'], ['6', 'Student societies'], ['8', 'Campus updates']].map(([value, label]) => <div key={label}><p className="font-display text-2xl font-extrabold text-brand-300 sm:text-3xl">{value}</p><p className="mt-1 text-xs font-medium text-slate-400 sm:text-sm">{label}</p></div>)}
        </div>
      </section>

      <section className="section-spacing bg-slate-50">
        <div className="container-shell">
          <SectionHeading eyebrow="Happening soon" title="Find your next campus moment" description="Curated workshops, competitions, and experiences from trusted university organizers." link={{ label: 'Browse all events', to: '/events' }} />
          {loading ? <CardGridSkeleton /> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{events.filter((event) => event.featured).slice(0, 3).map((event) => <EventCard key={event.id} event={event} />)}</div>}
        </div>
      </section>

      <section className="section-spacing bg-white">
        <div className="container-shell">
          <SectionHeading eyebrow="Meet your people" title="Communities built around what matters" description="Learn with peers, lead ambitious projects, and build friendships beyond the classroom." link={{ label: 'Explore communities', to: '/communities' }} />
          {loading ? <CardGridSkeleton count={4} /> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{communities.filter((community) => community.featured).slice(0, 4).map((community) => <CommunityCard key={community.id} community={community} upcomingEvents={events.filter((event) => event.communityId === community.id).length} />)}</div>}
        </div>
      </section>

      <section className="section-spacing bg-slate-50">
        <div className="container-shell">
          <SectionHeading eyebrow="Stay informed" title="The latest from across campus" description="Important notices, new opportunities, and community news in one clear feed." link={{ label: 'See every announcement', to: '/announcements' }} />
          {loading ? <CardGridSkeleton /> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{announcements.slice(0, 3).map((announcement) => <AnnouncementCard key={announcement.id} announcement={announcement} />)}</div>}
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="container-shell">
          <div className="grid gap-5 lg:grid-cols-3">
            {[
              { icon: Zap, title: 'Everything in one place', text: 'Replace scattered chats and posters with a searchable, trusted campus hub.' },
              { icon: UsersRound, title: 'Built for every role', text: 'Students discover. Organizers coordinate. Administrators keep the platform safe.' },
              { icon: ShieldCheck, title: 'Designed for trust', text: 'Role checks, protected actions, clear ownership, and AWS-ready security boundaries.' },
            ].map(({ icon: Icon, title, text }) => <div key={title} className="rounded-2xl border bg-white p-6 shadow-card"><span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-700"><Icon className="size-5" /></span><h3 className="mt-5 text-lg font-bold text-navy-950">{title}</h3><p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p></div>)}
          </div>
        </div>
      </section>

      <section className="pb-20 pt-4 sm:pb-24">
        <div className="container-shell">
          <div className="relative overflow-hidden rounded-[2rem] bg-navy-950 px-6 py-12 text-center text-white shadow-soft sm:px-12 sm:py-16">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(53,149,252,.28),transparent_35%),radial-gradient(circle_at_85%_80%,rgba(99,102,241,.2),transparent_35%)]" />
            <div className="relative mx-auto max-w-2xl"><span className="mx-auto grid size-12 place-items-center rounded-2xl bg-white/10 text-brand-300"><GraduationCap className="size-6" /></span><h2 className="mt-5 text-3xl font-extrabold sm:text-4xl">Make more of your campus experience.</h2><p className="mx-auto mt-4 max-w-xl text-slate-300">Create your student profile, save your place at the next event, and join a community today.</p><Button asChild size="lg" className="mt-7 bg-white text-navy-950 hover:bg-brand-50"><Link to="/register">Join CampusConnect<ArrowRight className="size-4" /></Link></Button></div>
          </div>
        </div>
      </section>
    </>
  )
}
