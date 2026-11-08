import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { Camera, CalendarCheck2, CheckCircle2, LoaderCircle, Mail, Save, ShieldCheck, UsersRound } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/context/auth-context'
import { useCampusData } from '@/context/data-context'
import { useToast } from '@/context/toast-context'
import { formatDate, splitCommaList } from '@/lib/utils'

export function ProfilePage() {
  const { user } = useAuth()
  const { data, pending, updateProfile } = useCampusData()
  const { showToast } = useToast()
  const [form, setForm] = useState({ fullName: '', department: '', academicYear: '', bio: '', interests: '', skills: '', avatarUrl: '' })

  useEffect(() => {
    if (user) setForm({ fullName: user.fullName, department: user.department, academicYear: user.academicYear, bio: user.bio, interests: user.interests.join(', '), skills: user.skills.join(', '), avatarUrl: user.avatarUrl })
  }, [user])
  if (!user) return null

  const update = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }))
  const uploadAvatar = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) {
      showToast({ title: 'Image not accepted', description: 'Choose a JPG, PNG, or WebP image smaller than 2 MB.', tone: 'error' })
      event.target.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = () => update('avatarUrl', String(reader.result))
    reader.onerror = () => showToast({ title: 'Could not read the image', tone: 'error' })
    reader.readAsDataURL(file)
  }
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (form.fullName.trim().length < 2 || !form.department.trim() || !form.academicYear) {
      showToast({ title: 'Complete the required fields', description: 'Name, department, and academic year are required.', tone: 'error' })
      return
    }
    await updateProfile({ ...form, interests: splitCommaList(form.interests), skills: splitCommaList(form.skills) }).catch(() => undefined)
  }

  const membershipIds = new Set(data?.memberships.filter((item) => item.userId === user.id).map((item) => item.communityId) ?? [])
  const registrationIds = new Set(data?.registrations.filter((item) => item.userId === user.id && item.status === 'registered').map((item) => item.eventId) ?? [])
  const joined = data?.communities.filter((item) => membershipIds.has(item.id)) ?? []
  const events = data?.events.filter((item) => registrationIds.has(item.id)) ?? []
  const managed = data?.communities.filter((item) => user.managedCommunityIds.includes(item.id)) ?? []

  return (
    <div>
      <div className="mb-8"><p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700">Account</p><h1 className="mt-2 text-3xl font-extrabold text-navy-950 sm:text-4xl">Your profile</h1><p className="mt-3 max-w-2xl text-slate-600">Keep your campus identity, academic details, and interests up to date.</p></div>
      <div className="grid gap-8 xl:grid-cols-[340px_1fr]">
        <aside className="space-y-5">
          <Card className="overflow-hidden"><div className="h-24 bg-gradient-to-r from-brand-600 to-indigo-600" /><CardContent className="-mt-12 p-6 pt-0 text-center"><Avatar src={form.avatarUrl} name={user.fullName} className="mx-auto size-24 border-4 shadow-soft" /><h2 className="mt-4 text-xl font-extrabold text-navy-950">{user.fullName}</h2><p className="mt-1 text-sm text-slate-500">{user.department}</p><div className="mt-3 flex justify-center gap-2"><Badge className="capitalize">{user.role}</Badge><Badge variant={user.status === 'active' ? 'success' : 'destructive'} className="capitalize">{user.status}</Badge></div><div className="mt-5 space-y-3 border-t pt-5 text-left text-sm"><p className="flex items-center gap-2 text-slate-600"><Mail className="size-4 text-brand-600" /><span className="truncate">{user.email}</span></p><p className="flex items-center gap-2 text-slate-600"><ShieldCheck className="size-4 text-brand-600" />Member since {formatDate(user.createdAt)}</p></div></CardContent></Card>
          <div className="grid grid-cols-2 gap-3"><Card><CardContent className="p-4 text-center"><CalendarCheck2 className="mx-auto size-5 text-brand-600" /><p className="mt-2 text-2xl font-extrabold text-navy-950">{events.length}</p><p className="text-xs text-slate-500">Events</p></CardContent></Card><Card><CardContent className="p-4 text-center"><UsersRound className="mx-auto size-5 text-violet-600" /><p className="mt-2 text-2xl font-extrabold text-navy-950">{user.role === 'organizer' ? managed.length : joined.length}</p><p className="text-xs text-slate-500">Communities</p></CardContent></Card></div>
        </aside>
        <div className="space-y-6">
          <Card><CardHeader><CardTitle>Personal and academic details</CardTitle><p className="text-sm text-slate-500">Fields marked with * are required.</p></CardHeader><CardContent><form onSubmit={submit} className="grid gap-5 sm:grid-cols-2" noValidate>
            <div className="space-y-2 sm:col-span-2"><Label>Profile picture</Label><div className="flex flex-col gap-3 rounded-xl border border-dashed bg-slate-50 p-4 sm:flex-row sm:items-center"><Avatar src={form.avatarUrl} name={form.fullName || user.fullName} className="size-14" /><div className="flex-1"><label htmlFor="avatar" className="focus-ring inline-flex cursor-pointer items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm font-semibold text-navy-800 shadow-sm hover:bg-brand-50"><Camera className="size-4" />Choose image</label><Input id="avatar" type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={uploadAvatar} /><p className="mt-1.5 text-xs text-slate-500">JPG, PNG, or WebP. Maximum 2 MB. Stored locally in demo mode.</p></div></div></div>
            <div className="space-y-2"><Label htmlFor="profile-name">Full name *</Label><Input id="profile-name" value={form.fullName} onChange={(event) => update('fullName', event.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="profile-email">University email</Label><Input id="profile-email" value={user.email} disabled /><p className="text-xs text-slate-500">Email changes require identity verification.</p></div>
            <div className="space-y-2"><Label htmlFor="profile-department">Department *</Label><Input id="profile-department" value={form.department} onChange={(event) => update('department', event.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="profile-year">Academic year *</Label><Select id="profile-year" value={form.academicYear} onChange={(event) => update('academicYear', event.target.value)}><option>Year 1</option><option>Year 2</option><option>Year 3</option><option>Year 4</option><option>Postgraduate</option><option>Doctoral</option><option>Society Organizer</option><option>Platform Administrator</option></Select></div>
            <div className="space-y-2 sm:col-span-2"><Label htmlFor="profile-bio">Bio</Label><Textarea id="profile-bio" value={form.bio} onChange={(event) => update('bio', event.target.value)} maxLength={400} placeholder="Share a little about what you are building or learning." /><p className="text-right text-xs text-slate-400">{form.bio.length}/400</p></div>
            <div className="space-y-2"><Label htmlFor="profile-interests">Technical interests</Label><Input id="profile-interests" value={form.interests} onChange={(event) => update('interests', event.target.value)} placeholder="Cloud, AI, robotics" /><p className="text-xs text-slate-500">Separate interests with commas.</p></div>
            <div className="space-y-2"><Label htmlFor="profile-skills">Skills</Label><Input id="profile-skills" value={form.skills} onChange={(event) => update('skills', event.target.value)} placeholder="TypeScript, AWS, Figma" /><p className="text-xs text-slate-500">Separate skills with commas.</p></div>
            <div className="flex justify-end border-t pt-5 sm:col-span-2"><Button type="submit" disabled={pending === 'profile'}>{pending === 'profile' ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}{pending === 'profile' ? 'Saving…' : 'Save profile'}</Button></div>
          </form></CardContent></Card>
          {(joined.length > 0 || managed.length > 0) && <Card><CardHeader><CardTitle>{user.role === 'organizer' ? 'Managed communities' : 'Joined communities'}</CardTitle></CardHeader><CardContent><div className="flex flex-wrap gap-2">{(user.role === 'organizer' ? managed : joined).map((community) => <Badge key={community.id} variant="outline" className="gap-1.5 px-3 py-2"><CheckCircle2 className="size-3.5 text-emerald-600" />{community.name}</Badge>)}</div></CardContent></Card>}
        </div>
      </div>
    </div>
  )
}
