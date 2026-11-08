import { Search, UsersRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { CommunityCard } from '@/components/community-card'
import { EmptyState } from '@/components/empty-state'
import { CardGridSkeleton } from '@/components/loading-state'
import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useAuth } from '@/context/auth-context'
import { useCampusData } from '@/context/data-context'

export function CommunitiesPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All interests')
  const { data, loading, pending, joinCommunity, leaveCommunity } = useCampusData()
  const { user } = useAuth()
  const memberships = new Set(data?.memberships.filter((item) => item.userId === user?.id).map((item) => item.communityId))
  const categories = ['All interests', ...Array.from(new Set(data?.communities.filter((item) => item.status === 'approved').map((item) => item.category) ?? []))]
  const communities = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return (data?.communities ?? [])
      .filter((community) => community.status === 'approved')
      .filter((community) => category === 'All interests' || community.category === category)
      .filter((community) => !normalized || [community.name, community.description, community.category, ...community.leaderNames].some((value) => value.toLowerCase().includes(normalized)))
      .sort((a, b) => Number(b.featured) - Number(a.featured) || b.memberCount - a.memberCount)
  }, [category, data?.communities, query])
  const reset = () => { setQuery(''); setCategory('All interests') }

  return (
    <section className="min-h-[70vh] py-12 sm:py-16">
      <div className="container-shell">
        <PageHeader eyebrow="Belong & build" title="Find your campus community" description="Explore student-led societies, meet their leaders, and join a group that turns your interests into shared experiences." actions={<Badge variant="outline" className="h-9 px-3"><UsersRound className="mr-1.5 size-3.5 text-brand-600" />{communities.length} communities</Badge>} />
        <div className="mb-8 rounded-xl border bg-white p-4 shadow-card"><div className="grid gap-3 md:grid-cols-[1fr_260px_auto]"><div className="relative"><Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input className="pl-10" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search societies, interests, or leaders…" aria-label="Search communities" /></div><Select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter communities by interest">{categories.map((item) => <option key={item}>{item}</option>)}</Select><Button variant="ghost" onClick={reset} disabled={!query && category === 'All interests'}>Clear</Button></div></div>
        {loading ? <CardGridSkeleton count={6} /> : communities.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{communities.map((community) => { const joined = memberships.has(community.id); return <CommunityCard key={community.id} community={community} joined={joined} upcomingEvents={data?.events.filter((event) => event.communityId === community.id && event.status === 'published').length ?? 0} canJoin={user?.role === 'student'} pending={pending === `${joined ? 'leave' : 'join'}:${community.id}`} onToggle={() => void (joined ? leaveCommunity(community.id) : joinCommunity(community.id)).catch(() => undefined)} /> })}</div> : <EmptyState icon={Search} title="No communities match those filters" description="Try a different term or show every approved student community." actionLabel="Show all communities" onAction={reset} />}
      </div>
    </section>
  )
}
