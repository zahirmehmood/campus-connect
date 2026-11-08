import { Search, SlidersHorizontal, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { EmptyState } from '@/components/empty-state'
import { EventCard } from '@/components/event-card'
import { CardGridSkeleton } from '@/components/loading-state'
import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useAuth } from '@/context/auth-context'
import { useCampusData } from '@/context/data-context'
import type { EventCategory } from '@/types'

const categories: Array<'All categories' | EventCategory> = ['All categories', 'Technology', 'Hackathons', 'Workshops', 'Career Development', 'Entrepreneurship', 'Cultural Events', 'Competitions']

export function EventsPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<(typeof categories)[number]>('All categories')
  const [sort, setSort] = useState<'soonest' | 'popular'>('soonest')
  const { data, loading } = useCampusData()
  const { user } = useAuth()

  const registrations = new Set(data?.registrations.filter((item) => item.userId === user?.id && item.status === 'registered').map((item) => item.eventId))
  const events = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return (data?.events ?? [])
      .filter((event) => event.status === 'published' && new Date(event.endAt) > new Date())
      .filter((event) => category === 'All categories' || event.category === category)
      .filter((event) => !normalized || [event.title, event.description, event.organizerName, event.location, ...event.tags].some((value) => value.toLowerCase().includes(normalized)))
      .sort((a, b) => sort === 'popular' ? b.registrationCount - a.registrationCount : a.startAt.localeCompare(b.startAt))
  }, [category, data?.events, query, sort])

  const clear = () => { setQuery(''); setCategory('All categories'); setSort('soonest') }

  return (
    <section className="min-h-[70vh] py-12 sm:py-16">
      <div className="container-shell">
        <PageHeader eyebrow="Discover" title="Events across your university" description="Find workshops, competitions, cultural moments, and career opportunities curated by verified campus organizers." actions={<Badge variant="outline" className="h-9 px-3"><Sparkles className="mr-1.5 size-3.5 text-brand-600" />{events.length} upcoming</Badge>} />
        <div className="mb-8 rounded-xl border bg-white p-4 shadow-card">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px_190px_auto]">
            <div className="relative"><Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-10" placeholder="Search events, organizers, locations…" aria-label="Search events" /></div>
            <div className="relative"><SlidersHorizontal className="pointer-events-none absolute left-3.5 top-1/2 z-10 size-4 -translate-y-1/2 text-slate-400" /><Select value={category} onChange={(event) => setCategory(event.target.value as typeof category)} className="pl-10" aria-label="Filter by category">{categories.map((item) => <option key={item}>{item}</option>)}</Select></div>
            <Select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} aria-label="Sort events"><option value="soonest">Soonest first</option><option value="popular">Most popular</option></Select>
            <Button variant="ghost" onClick={clear} disabled={!query && category === 'All categories' && sort === 'soonest'}>Clear</Button>
          </div>
        </div>
        {loading ? <CardGridSkeleton count={6} /> : events.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{events.map((event) => <EventCard key={event.id} event={event} registered={registrations.has(event.id)} />)}</div> : <EmptyState icon={Search} title="No events match those filters" description="Try a broader search or reset the filters to see every upcoming event." actionLabel="Reset filters" onAction={clear} />}
      </div>
    </section>
  )
}
