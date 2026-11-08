import { ArrowLeft, CheckCircle2, Download, Search, UserCheck, UserRoundX, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { EmptyState } from '@/components/empty-state'
import { LoadingState } from '@/components/loading-state'
import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/stat-card'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useAuth } from '@/context/auth-context'
import { useCampusData } from '@/context/data-context'
import { formatDateTime } from '@/lib/utils'
import type { AttendanceStatus } from '@/types'

export function ParticipantsPage() {
  const { id } = useParams()
  const [query, setQuery] = useState('')
  const { user } = useAuth()
  const { data, loading, pending, setAttendance } = useCampusData()
  const event = data?.events.find((candidate) => candidate.id === id && (candidate.organizerId === user?.id || user?.role === 'admin'))
  const participants = useMemo(() => {
    if (!data || !event) return []
    const normalized = query.trim().toLowerCase()
    return data.registrations.filter((item) => item.eventId === event.id && item.status === 'registered').map((registration) => ({ registration, person: data.users.find((candidate) => candidate.id === registration.userId) })).filter((entry) => entry.person && (!normalized || [entry.person.fullName, entry.person.email, entry.person.department].some((value) => value.toLowerCase().includes(normalized))))
  }, [data, event, query])
  if (loading) return <LoadingState label="Loading participant list…" />
  if (!event) return <EmptyState title="Event not found" description="You can only view participants for events managed by your account." />
  const attended = participants.filter((entry) => entry.registration.attendance === 'attended').length
  const noShows = participants.filter((entry) => entry.registration.attendance === 'no-show').length
  const exportCsv = () => {
    const rows = [['Name', 'Email', 'Department', 'Registered at', 'Attendance'], ...participants.map(({ person, registration }) => [person?.fullName ?? '', person?.email ?? '', person?.department ?? '', registration.registeredAt, registration.attendance])]
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-participants.csv`; anchor.click(); URL.revokeObjectURL(url)
  }

  return <div><Link to="/organizer/events" className="focus-ring mb-5 inline-flex items-center gap-1.5 rounded-md text-sm font-semibold text-slate-600 hover:text-brand-700"><ArrowLeft className="size-4" />Back to events</Link><PageHeader eyebrow="Registration management" title={event.title} description={`${formatDateTime(event.startAt)} · ${event.location}`} actions={<Button variant="outline" onClick={exportCsv} disabled={!participants.length}><Download className="size-4" />Export CSV</Button>} />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Registered" value={event.registrationCount} hint={`${event.capacity - event.registrationCount} places remaining`} icon={Users} /><StatCard label="Checked in" value={attended} hint="Marked as attended" icon={UserCheck} tone="emerald" /><StatCard label="No-shows" value={noShows} hint="Marked by organizers" icon={UserRoundX} tone="amber" /><StatCard label="Capacity" value={event.capacity} hint="Maximum registrations" icon={CheckCircle2} tone="violet" /></div>
    <Card className="mt-7"><CardContent className="p-0"><div className="border-b p-4"><div className="relative max-w-md"><Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input className="pl-10" placeholder="Search name, email, or department…" value={query} onChange={(e) => setQuery(e.target.value)} /></div></div>
      {participants.length ? <div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left"><thead><tr className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><th className="px-5 py-3 font-semibold">Participant</th><th className="px-5 py-3 font-semibold">Department</th><th className="px-5 py-3 font-semibold">Registered</th><th className="px-5 py-3 font-semibold">Status</th><th className="px-5 py-3 font-semibold">Attendance</th></tr></thead><tbody>{participants.map(({ person, registration }) => person && <tr key={person.id} className="border-b last:border-0 hover:bg-slate-50/70"><td className="px-5 py-4"><div className="flex items-center gap-3"><Avatar src={person.avatarUrl} name={person.fullName} /><div><p className="text-sm font-bold text-navy-900">{person.fullName}</p><p className="text-xs text-slate-500">{person.email}</p></div></div></td><td className="px-5 py-4 text-sm text-slate-600">{person.department}</td><td className="px-5 py-4 text-sm text-slate-600">{formatDateTime(registration.registeredAt)}</td><td className="px-5 py-4"><Badge variant="success">Registered</Badge></td><td className="px-5 py-4"><Select className="h-9 min-w-32" value={registration.attendance} disabled={pending === `attendance:${person.id}`} onChange={(event) => void setAttendance(id ?? '', person.id, event.target.value as AttendanceStatus).catch(() => undefined)}><option value="pending">Pending</option><option value="attended">Attended</option><option value="no-show">No-show</option></Select></td></tr>)}</tbody></table></div> : <div className="p-6"><EmptyState icon={Users} title={query ? 'No participants match your search' : 'No registrations yet'} description={query ? 'Try searching with a different name, email, or department.' : 'Registered students will appear here automatically.'} /></div>}
    </CardContent></Card>
  </div>
}
