import { Check, Clock3, Search, UsersRound, X } from 'lucide-react'
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
import { useCampusData } from '@/context/data-context'
import { formatDate } from '@/lib/utils'

export function AdminCommunitiesPage() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const { data, loading, pending, setCommunityStatus } = useCampusData()
  const communities = useMemo(() => (data?.communities ?? []).filter((item) => status === 'all' || item.status === status).filter((item) => !query.trim() || [item.name, item.category, item.description, ...item.leaderNames].some((value) => value.toLowerCase().includes(query.trim().toLowerCase()))).sort((a, b) => Number(b.status === 'pending') - Number(a.status === 'pending') || b.createdAt.localeCompare(a.createdAt)), [data?.communities, query, status])
  if (loading) return <LoadingState label="Loading societies…" />

  return <div><PageHeader eyebrow="Society governance" title="Student communities" description="Review new applications and manage the standing of registered campus societies." />
    <div className="mb-6 grid gap-3 rounded-xl border bg-white p-4 shadow-card md:grid-cols-[1fr_220px]"><div className="relative"><Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input className="pl-10" placeholder="Search communities or leaders…" value={query} onChange={(event) => setQuery(event.target.value)} /></div><Select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option><option value="pending">Pending review</option><option value="approved">Approved</option><option value="rejected">Rejected</option></Select></div>
    {communities.length ? <div className="grid gap-5 xl:grid-cols-2">{communities.map((community) => <Card key={community.id} className="overflow-hidden"><CardContent className="p-0"><div className="grid sm:grid-cols-[160px_1fr]"><img src={community.imageUrl} alt="" className="h-44 w-full object-cover sm:h-full" /><div className="p-5"><div className="flex items-start justify-between gap-3"><div><Badge variant={community.status === 'approved' ? 'success' : community.status === 'pending' ? 'warning' : 'destructive'} className="capitalize">{community.status === 'pending' && <Clock3 className="mr-1 size-3" />}{community.status}</Badge><h2 className="mt-2 text-lg font-bold text-navy-950">{community.name}</h2></div><Badge variant="secondary">{community.category}</Badge></div><p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">{community.description}</p><div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-500"><div><p className="font-semibold uppercase tracking-wide text-slate-400">Leader</p><p className="mt-1 font-semibold text-navy-800">{community.leaderNames.join(', ')}</p></div><div><p className="font-semibold uppercase tracking-wide text-slate-400">Submitted</p><p className="mt-1 font-semibold text-navy-800">{formatDate(community.createdAt)}</p></div></div><div className="mt-5 flex flex-wrap gap-2 border-t pt-4">{community.status !== 'approved' && <Button size="sm" onClick={() => void setCommunityStatus(community.id, 'approved').catch(() => undefined)} disabled={pending === `community:${community.id}`}><Check className="size-3.5" />Approve</Button>}{community.status !== 'rejected' && <Button size="sm" variant="outline" onClick={() => void setCommunityStatus(community.id, 'rejected').catch(() => undefined)} disabled={pending === `community:${community.id}`}><X className="size-3.5" />{community.status === 'approved' ? 'Revoke approval' : 'Reject'}</Button>}{community.status === 'approved' && <Button asChild size="sm" variant="ghost"><Link to={`/communities/${community.id}`}>View public page</Link></Button>}</div></div></div></CardContent></Card>)}</div> : <EmptyState icon={UsersRound} title="No communities found" description="Adjust the search or status filter." />}
  </div>
}
