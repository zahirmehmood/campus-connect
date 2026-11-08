import { ArrowLeft, BellRing, CalendarDays, Share2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { AnnouncementCard } from '@/components/announcement-card'
import { EmptyState } from '@/components/empty-state'
import { LoadingState } from '@/components/loading-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/auth-context'
import { useCampusData } from '@/context/data-context'
import { useToast } from '@/context/toast-context'
import { formatDateTime } from '@/lib/utils'

export function AnnouncementDetailPage() {
  const { id } = useParams()
  const { data, loading } = useCampusData()
  const { user } = useAuth()
  const { showToast } = useToast()
  if (loading) return <LoadingState className="min-h-[65vh]" label="Loading announcement…" />
  const announcement = data?.announcements.find((candidate) => candidate.id === id && (candidate.status === 'published' || user?.role === 'admin'))
  if (!announcement) return <div className="container-shell py-16"><EmptyState title="Announcement not found" description="This announcement may have been removed or the link is no longer valid." /></div>
  const related = data?.announcements.filter((candidate) => candidate.id !== announcement.id && candidate.status === 'published' && candidate.category === announcement.category).slice(0, 3) ?? []
  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: announcement.title, text: announcement.summary, url: window.location.href })
      else { await navigator.clipboard.writeText(window.location.href); showToast({ title: 'Announcement link copied', tone: 'success' }) }
    } catch { /* User cancelled sharing. */ }
  }

  return (
    <section className="py-12 sm:py-16">
      <div className="container-shell">
        <div className="mx-auto max-w-4xl">
          <Link to="/announcements" className="focus-ring inline-flex items-center gap-1.5 rounded-md text-sm font-semibold text-slate-600 hover:text-brand-700"><ArrowLeft className="size-4" />Back to announcements</Link>
          <article className="mt-7 overflow-hidden rounded-2xl border bg-white shadow-card">
            <div className="h-2 bg-gradient-to-r from-brand-500 via-blue-500 to-indigo-500" />
            <div className="p-6 sm:p-10 lg:p-12">
              <div className="flex flex-wrap gap-2">{announcement.priority === 'important' && <Badge variant="warning"><BellRing className="mr-1 size-3" />Important</Badge>}<Badge>{announcement.category}</Badge><Badge variant="secondary" className="capitalize">{announcement.scope}</Badge></div>
              <h1 className="mt-6 text-3xl font-extrabold leading-tight text-navy-950 sm:text-5xl">{announcement.title}</h1>
              <p className="mt-5 text-xl leading-relaxed text-slate-600">{announcement.summary}</p>
              <div className="mt-7 flex flex-col justify-between gap-4 border-y py-5 sm:flex-row sm:items-center"><div><p className="text-sm font-bold text-navy-900">{announcement.authorName}</p><p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><CalendarDays className="size-3.5" />Published {formatDateTime(announcement.publishedAt)}</p></div><Button variant="outline" onClick={() => void share()}><Share2 className="size-4" />Share update</Button></div>
              <div className="prose prose-slate mt-8 max-w-none"><p className="whitespace-pre-line text-base leading-8 text-slate-700">{announcement.body}</p></div>
            </div>
          </article>
        </div>
        {related.length > 0 && <div className="mx-auto mt-14 max-w-6xl"><h2 className="mb-6 text-2xl font-extrabold text-navy-950">Related updates</h2><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{related.map((item) => <AnnouncementCard key={item.id} announcement={item} />)}</div></div>}
      </div>
    </section>
  )
}
