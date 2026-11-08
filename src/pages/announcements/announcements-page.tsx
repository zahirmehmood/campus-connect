import { Megaphone, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { AnnouncementCard } from '@/components/announcement-card'
import { EmptyState } from '@/components/empty-state'
import { CardGridSkeleton } from '@/components/loading-state'
import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useCampusData } from '@/context/data-context'
import type { AnnouncementCategory } from '@/types'

const categories: Array<'All updates' | AnnouncementCategory> = ['All updates', 'Academic', 'Campus Life', 'Events', 'Opportunities', 'Important']

export function AnnouncementsPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<(typeof categories)[number]>('All updates')
  const { data, loading } = useCampusData()
  const announcements = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return (data?.announcements ?? [])
      .filter((item) => item.status === 'published')
      .filter((item) => category === 'All updates' || item.category === category)
      .filter((item) => !normalized || [item.title, item.summary, item.body, item.authorName].some((value) => value.toLowerCase().includes(normalized)))
      .sort((a, b) => Number(b.priority === 'important') - Number(a.priority === 'important') || b.publishedAt.localeCompare(a.publishedAt))
  }, [category, data?.announcements, query])
  const reset = () => { setQuery(''); setCategory('All updates') }

  return (
    <section className="min-h-[70vh] py-12 sm:py-16">
      <div className="container-shell">
        <PageHeader eyebrow="Campus feed" title="Announcements that keep you ahead" description="Follow important notices, campus changes, society news, and new student opportunities." actions={<Badge variant="outline" className="h-9 px-3"><Megaphone className="mr-1.5 size-3.5 text-brand-600" />{announcements.length} updates</Badge>} />
        <div className="mb-8 rounded-xl border bg-white p-4 shadow-card"><div className="grid gap-3 md:grid-cols-[1fr_240px_auto]"><div className="relative"><Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input className="pl-10" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search announcements…" aria-label="Search announcements" /></div><Select value={category} onChange={(event) => setCategory(event.target.value as typeof category)} aria-label="Filter announcements">{categories.map((item) => <option key={item}>{item}</option>)}</Select><Button variant="ghost" onClick={reset} disabled={!query && category === 'All updates'}>Clear</Button></div></div>
        {loading ? <CardGridSkeleton count={6} /> : announcements.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{announcements.map((announcement) => <AnnouncementCard key={announcement.id} announcement={announcement} />)}</div> : <EmptyState icon={Search} title="No announcements found" description="Adjust your search or reset the category filter to see all campus updates." actionLabel="Reset filters" onAction={reset} />}
      </div>
    </section>
  )
}
