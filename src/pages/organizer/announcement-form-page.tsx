import { useState, type FormEvent } from 'react'
import { ArrowLeft, LoaderCircle, Megaphone, Send } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/context/auth-context'
import { useCampusData } from '@/context/data-context'
import { useToast } from '@/context/toast-context'
import type { AnnouncementCategory, AnnouncementInput } from '@/types'

const categories: AnnouncementCategory[] = ['Academic', 'Campus Life', 'Events', 'Opportunities', 'Important']

export function AnnouncementFormPage() {
  const { user } = useAuth()
  const { data, pending, publishAnnouncement } = useCampusData()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const managed = data?.communities.filter((community) => user?.managedCommunityIds.includes(community.id) && community.status === 'approved') ?? []
  const [form, setForm] = useState({ title: '', summary: '', body: '', category: 'Events' as AnnouncementCategory, scope: (user?.role === 'admin' ? 'campus' : 'community') as AnnouncementInput['scope'], communityId: managed[0]?.id ?? '', priority: 'normal' as AnnouncementInput['priority'], status: 'published' as AnnouncementInput['status'] })
  const update = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) => setForm((current) => ({ ...current, [field]: value }))
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (form.title.trim().length < 5 || form.summary.trim().length < 15 || form.body.trim().length < 30 || (form.scope === 'community' && !form.communityId)) {
      showToast({ title: 'Complete the announcement', description: 'Add a clear title, summary, body, and publishing destination.', tone: 'error' })
      return
    }
    try {
      await publishAnnouncement({ ...form, communityId: form.scope === 'community' ? form.communityId : undefined })
      navigate(user?.role === 'admin' ? '/admin/content' : '/organizer')
    } catch { /* Data context already presents the service error. */ }
  }
  const back = user?.role === 'admin' ? '/admin/content' : '/organizer'

  return <div><Link to={back} className="focus-ring mb-5 inline-flex items-center gap-1.5 rounded-md text-sm font-semibold text-slate-600 hover:text-brand-700"><ArrowLeft className="size-4" />Back to dashboard</Link><PageHeader eyebrow="Campus communications" title="Publish an announcement" description="Share a timely, useful update with the students who need to see it." />
    <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1fr_340px]" noValidate><Card><CardHeader><CardTitle>Announcement content</CardTitle></CardHeader><CardContent className="space-y-5"><div className="space-y-2"><Label htmlFor="announcement-title">Title *</Label><Input id="announcement-title" value={form.title} onChange={(event) => update('title', event.target.value)} maxLength={120} placeholder="What should students know?" /></div><div className="space-y-2"><Label htmlFor="announcement-summary">Summary *</Label><Textarea id="announcement-summary" className="min-h-24" value={form.summary} onChange={(event) => update('summary', event.target.value)} maxLength={240} placeholder="A short summary for announcement cards." /><p className="text-right text-xs text-slate-400">{form.summary.length}/240</p></div><div className="space-y-2"><Label htmlFor="announcement-body">Full announcement *</Label><Textarea id="announcement-body" className="min-h-64" value={form.body} onChange={(event) => update('body', event.target.value)} placeholder="Include dates, actions, links, and contact details students may need." /></div></CardContent></Card>
      <aside><Card className="sticky top-24"><CardHeader><CardTitle>Publishing settings</CardTitle></CardHeader><CardContent className="space-y-5"><div className="space-y-2"><Label htmlFor="announcement-category">Category</Label><Select id="announcement-category" value={form.category} onChange={(event) => update('category', event.target.value as AnnouncementCategory)}>{categories.map((category) => <option key={category}>{category}</option>)}</Select></div>{user?.role === 'admin' && <div className="space-y-2"><Label htmlFor="announcement-scope">Audience</Label><Select id="announcement-scope" value={form.scope} onChange={(event) => update('scope', event.target.value as AnnouncementInput['scope'])}><option value="campus">Entire campus</option><option value="community">One community</option></Select></div>}{form.scope === 'community' && <div className="space-y-2"><Label htmlFor="announcement-community">Community</Label><Select id="announcement-community" value={form.communityId} onChange={(event) => update('communityId', event.target.value)}><option value="">Select a community</option>{(user?.role === 'admin' ? data?.communities.filter((item) => item.status === 'approved') ?? [] : managed).map((community) => <option key={community.id} value={community.id}>{community.name}</option>)}</Select></div>}<div className="space-y-2"><Label htmlFor="announcement-priority">Priority</Label><Select id="announcement-priority" value={form.priority} onChange={(event) => update('priority', event.target.value as AnnouncementInput['priority'])}><option value="normal">Normal</option><option value="important">Important</option></Select></div><div className="space-y-2"><Label htmlFor="announcement-status">Status</Label><Select id="announcement-status" value={form.status} onChange={(event) => update('status', event.target.value as AnnouncementInput['status'])}><option value="published">Publish now</option><option value="draft">Save as draft</option></Select></div><div className="rounded-xl bg-brand-50 p-4"><Megaphone className="size-5 text-brand-700" /><p className="mt-2 text-sm font-bold text-navy-900">Clear and actionable</p><p className="mt-1 text-xs leading-relaxed text-slate-600">Use the important priority only for time-sensitive information students should act on.</p></div><Button type="submit" size="lg" className="w-full" disabled={pending === 'announcement:create'}>{pending === 'announcement:create' ? <LoaderCircle className="size-4 animate-spin" /> : form.status === 'published' ? <Send className="size-4" /> : <Megaphone className="size-4" />}{pending === 'announcement:create' ? 'Publishing…' : form.status === 'published' ? 'Publish announcement' : 'Save draft'}</Button></CardContent></Card></aside></form>
  </div>
}
