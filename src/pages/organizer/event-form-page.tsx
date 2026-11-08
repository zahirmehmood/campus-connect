import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { ArrowLeft, CalendarPlus, Image, LoaderCircle, Save } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { EmptyState } from '@/components/empty-state'
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
import { splitCommaList } from '@/lib/utils'
import type { EventCategory, EventInput } from '@/types'

const categories: EventCategory[] = ['Technology', 'Hackathons', 'Workshops', 'Career Development', 'Entrepreneurship', 'Cultural Events', 'Competitions']
const defaultImage = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=85'
const localDateTime = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}
const fromIso = (value: string) => localDateTime(new Date(value))

export function EventFormPage() {
  const { id } = useParams()
  const editing = Boolean(id)
  const { user } = useAuth()
  const { data, createEvent, updateEvent, pending } = useCampusData()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const initial = useMemo(() => { const start = new Date(); start.setDate(start.getDate() + 7); start.setHours(17, 0, 0, 0); const end = new Date(start); end.setHours(19, 0); return { title: '', description: '', details: '', communityId: '', category: 'Technology' as EventCategory, startAt: localDateTime(start), endAt: localDateTime(end), location: '', format: 'In person' as EventInput['format'], capacity: '50', imageUrl: defaultImage, status: 'draft' as EventInput['status'], featured: false, tags: '' } }, [])
  const [form, setForm] = useState(initial)
  const existing = data?.events.find((event) => event.id === id && event.organizerId === user?.id)

  useEffect(() => {
    if (existing) setForm({ title: existing.title, description: existing.description, details: existing.details, communityId: existing.communityId ?? '', category: existing.category, startAt: fromIso(existing.startAt), endAt: fromIso(existing.endAt), location: existing.location, format: existing.format, capacity: String(existing.capacity), imageUrl: existing.imageUrl, status: existing.status === 'hidden' ? 'draft' : existing.status, featured: existing.featured, tags: existing.tags.join(', ') })
  }, [existing])
  const update = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) => setForm((current) => ({ ...current, [field]: value }))

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const capacity = Number(form.capacity)
    if (form.title.trim().length < 4 || form.description.trim().length < 20 || form.details.trim().length < 40 || !form.location.trim() || !Number.isInteger(capacity) || capacity < 1) {
      showToast({ title: 'Complete the event details', description: 'Add a clear title, descriptions, location, and valid capacity.', tone: 'error' })
      return
    }
    if (new Date(form.endAt) <= new Date(form.startAt)) {
      showToast({ title: 'Check the event schedule', description: 'The end time must be after the start time.', tone: 'error' })
      return
    }
    const input: EventInput = { ...form, communityId: form.communityId || undefined, title: form.title.trim(), description: form.description.trim(), details: form.details.trim(), location: form.location.trim(), capacity, startAt: new Date(form.startAt).toISOString(), endAt: new Date(form.endAt).toISOString(), tags: splitCommaList(form.tags), imageUrl: form.imageUrl.trim() || defaultImage }
    try {
      if (editing && id) await updateEvent(id, input)
      else await createEvent(input)
      navigate('/organizer/events')
    } catch { /* Data context already presents the service error. */ }
  }

  if (editing && data && !existing) return <EmptyState title="Event not found" description="You can only edit events created by your organizer account." />
  const communities = data?.communities.filter((community) => user?.managedCommunityIds.includes(community.id) && community.status === 'approved') ?? []
  const submitting = pending === 'event:create' || pending === `event:update:${id}`

  return (
    <div><Link to="/organizer/events" className="focus-ring mb-5 inline-flex items-center gap-1.5 rounded-md text-sm font-semibold text-slate-600 hover:text-brand-700"><ArrowLeft className="size-4" />Back to events</Link><PageHeader eyebrow={editing ? 'Event management' : 'New event'} title={editing ? 'Edit event' : 'Create a campus event'} description="Publish complete, useful details so students can decide and register with confidence." />
      <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1fr_340px]" noValidate>
        <div className="space-y-6">
          <Card><CardHeader><CardTitle>Event essentials</CardTitle></CardHeader><CardContent className="grid gap-5 sm:grid-cols-2"><div className="space-y-2 sm:col-span-2"><Label htmlFor="event-title">Event name *</Label><Input id="event-title" value={form.title} onChange={(event) => update('title', event.target.value)} placeholder="A clear, memorable event name" maxLength={100} /></div><div className="space-y-2 sm:col-span-2"><Label htmlFor="event-description">Short description *</Label><Textarea id="event-description" value={form.description} onChange={(event) => update('description', event.target.value)} placeholder="Summarize the value of this event in one or two sentences." maxLength={240} className="min-h-24" /><p className="text-right text-xs text-slate-400">{form.description.length}/240</p></div><div className="space-y-2 sm:col-span-2"><Label htmlFor="event-details">Full details *</Label><Textarea id="event-details" value={form.details} onChange={(event) => update('details', event.target.value)} placeholder="What will happen? Who should attend? What should participants bring?" className="min-h-40" /></div><div className="space-y-2"><Label htmlFor="event-category">Category *</Label><Select id="event-category" value={form.category} onChange={(event) => update('category', event.target.value as EventCategory)}>{categories.map((item) => <option key={item}>{item}</option>)}</Select></div><div className="space-y-2"><Label htmlFor="event-community">Community</Label><Select id="event-community" value={form.communityId} onChange={(event) => update('communityId', event.target.value)}><option value="">Independent organizer event</option>{communities.map((community) => <option key={community.id} value={community.id}>{community.name}</option>)}</Select></div><div className="space-y-2 sm:col-span-2"><Label htmlFor="event-tags">Tags</Label><Input id="event-tags" value={form.tags} onChange={(event) => update('tags', event.target.value)} placeholder="AWS, beginner, hands-on" /><p className="text-xs text-slate-500">Separate tags with commas.</p></div></CardContent></Card>
          <Card><CardHeader><CardTitle>Schedule and place</CardTitle></CardHeader><CardContent className="grid gap-5 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="event-start">Starts *</Label><Input id="event-start" type="datetime-local" value={form.startAt} onChange={(event) => update('startAt', event.target.value)} /></div><div className="space-y-2"><Label htmlFor="event-end">Ends *</Label><Input id="event-end" type="datetime-local" value={form.endAt} onChange={(event) => update('endAt', event.target.value)} /></div><div className="space-y-2"><Label htmlFor="event-location">Location *</Label><Input id="event-location" value={form.location} onChange={(event) => update('location', event.target.value)} placeholder="Building and room, or meeting URL" /></div><div className="space-y-2"><Label htmlFor="event-format">Format *</Label><Select id="event-format" value={form.format} onChange={(event) => update('format', event.target.value as EventInput['format'])}><option>In person</option><option>Hybrid</option><option>Online</option></Select></div><div className="space-y-2"><Label htmlFor="event-capacity">Registration capacity *</Label><Input id="event-capacity" type="number" min="1" max="10000" step="1" value={form.capacity} onChange={(event) => update('capacity', event.target.value)} /></div></CardContent></Card>
          <Card><CardHeader><CardTitle>Event image</CardTitle></CardHeader><CardContent><div className="space-y-2"><Label htmlFor="event-image">Image URL</Label><div className="relative"><Image className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input id="event-image" value={form.imageUrl} onChange={(event) => update('imageUrl', event.target.value)} className="pl-10" placeholder="https://…" /></div><p className="text-xs text-slate-500">Production mode should use the presigned S3 upload endpoint instead of arbitrary external URLs.</p></div></CardContent></Card>
        </div>
        <aside><Card className="sticky top-24"><CardHeader><CardTitle>Publish settings</CardTitle></CardHeader><CardContent className="space-y-5"><div className="space-y-2"><Label htmlFor="event-status">Status</Label><Select id="event-status" value={form.status} onChange={(event) => update('status', event.target.value as EventInput['status'])}><option value="draft">Save as draft</option><option value="published">Publish now</option></Select><p className="text-xs leading-relaxed text-slate-500">Drafts remain visible only in your organizer workspace.</p></div><label className="flex cursor-pointer items-start gap-3 rounded-xl border bg-slate-50 p-4"><input type="checkbox" checked={form.featured} onChange={(event) => update('featured', event.target.checked)} className="mt-1 size-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" /><span><span className="block text-sm font-bold text-navy-900">Feature this event</span><span className="mt-1 block text-xs leading-relaxed text-slate-500">Eligible for prominent placement in discovery views.</span></span></label>{form.imageUrl && <img src={form.imageUrl} alt="Event image preview" className="h-40 w-full rounded-xl object-cover" />}<div className="border-t pt-5"><Button type="submit" size="lg" className="w-full" disabled={submitting}>{submitting ? <LoaderCircle className="size-4 animate-spin" /> : editing ? <Save className="size-4" /> : <CalendarPlus className="size-4" />}{submitting ? 'Saving…' : editing ? 'Save changes' : form.status === 'published' ? 'Create and publish' : 'Save draft'}</Button></div></CardContent></Card></aside>
      </form>
    </div>
  )
}
