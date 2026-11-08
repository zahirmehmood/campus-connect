import { CalendarDays, Eye, EyeOff, FilePlus2, Megaphone, Search, ShieldCheck } from 'lucide-react'
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
import { formatDateTime } from '@/lib/utils'

interface ContentRow { id: string; type: 'event' | 'announcement'; title: string; summary: string; owner: string; date: string; status: 'draft' | 'published' | 'hidden'; category: string }

export function AdminContentPage() {
  const [query, setQuery] = useState('')
  const [type, setType] = useState('all')
  const [status, setStatus] = useState('all')
  const { data, loading, pending, setContentStatus } = useCampusData()
  const rows = useMemo<ContentRow[]>(() => {
    if (!data) return []
    const events: ContentRow[] = data.events.map((item) => ({ id: item.id, type: 'event', title: item.title, summary: item.description, owner: item.organizerName, date: item.startAt, status: item.status, category: item.category }))
    const announcements: ContentRow[] = data.announcements.map((item) => ({ id: item.id, type: 'announcement', title: item.title, summary: item.summary, owner: item.authorName, date: item.publishedAt, status: item.status, category: item.category }))
    const normalized = query.trim().toLowerCase()
    return [...events, ...announcements].filter((item) => type === 'all' || item.type === type).filter((item) => status === 'all' || item.status === status).filter((item) => !normalized || [item.title, item.summary, item.owner, item.category].some((value) => value.toLowerCase().includes(normalized))).sort((a, b) => b.date.localeCompare(a.date))
  }, [data, query, status, type])
  if (loading) return <LoadingState label="Loading platform content…" />

  return <div><PageHeader eyebrow="Content safety" title="Events and announcements" description="Review published material, hide inappropriate content, and restore content after review." actions={<Button asChild><Link to="/admin/announcements/new"><FilePlus2 className="size-4" />New announcement</Link></Button>} />
    <div className="mb-6 grid gap-3 rounded-xl border bg-white p-4 shadow-card lg:grid-cols-[1fr_190px_190px]"><div className="relative"><Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input className="pl-10" placeholder="Search content or publisher…" value={query} onChange={(event) => setQuery(event.target.value)} /></div><Select value={type} onChange={(event) => setType(event.target.value)}><option value="all">All content</option><option value="event">Events</option><option value="announcement">Announcements</option></Select><Select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option><option value="published">Published</option><option value="draft">Draft</option><option value="hidden">Hidden</option></Select></div>
    {rows.length ? <div className="space-y-4">{rows.map((row) => { const Icon = row.type === 'event' ? CalendarDays : Megaphone; return <Card key={`${row.type}-${row.id}`}><CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center"><span className={`grid size-11 shrink-0 place-items-center rounded-xl ${row.type === 'event' ? 'bg-brand-50 text-brand-700' : 'bg-violet-50 text-violet-700'}`}><Icon className="size-5" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><Badge variant="secondary" className="capitalize">{row.type}</Badge><Badge variant={row.status === 'published' ? 'success' : row.status === 'hidden' ? 'destructive' : 'secondary'} className="capitalize">{row.status}</Badge><span className="text-xs text-slate-400">{row.category}</span></div><h2 className="mt-2 truncate text-base font-bold text-navy-950">{row.title}</h2><p className="mt-1 line-clamp-1 text-sm text-slate-500">{row.summary}</p><p className="mt-2 text-xs font-medium text-slate-400">{row.owner} · {formatDateTime(row.date)}</p></div><div className="flex shrink-0 gap-2"><Button asChild size="sm" variant="ghost"><Link to={row.type === 'event' ? `/events/${row.id}` : `/announcements/${row.id}`}><Eye className="size-3.5" />Preview</Link></Button><Button size="sm" variant={row.status === 'hidden' ? 'default' : 'outline'} onClick={() => void setContentStatus(row.type, row.id, row.status === 'hidden' ? 'published' : 'hidden').catch(() => undefined)} disabled={pending === `content:${row.id}`}>{row.status === 'hidden' ? <><ShieldCheck className="size-3.5" />Restore</> : <><EyeOff className="size-3.5" />Hide</>}</Button></div></CardContent></Card> })}</div> : <EmptyState icon={ShieldCheck} title="No content found" description="Adjust your search, type, or status filters." />}
  </div>
}
