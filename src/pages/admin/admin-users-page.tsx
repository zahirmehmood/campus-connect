import { Download, Search, ShieldCheck, UserCheck, UserRoundX, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { EmptyState } from '@/components/empty-state'
import { LoadingState } from '@/components/loading-state'
import { PageHeader } from '@/components/page-header'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useAuth } from '@/context/auth-context'
import { useCampusData } from '@/context/data-context'
import { formatDate } from '@/lib/utils'

export function AdminUsersPage() {
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('all')
  const [status, setStatus] = useState('all')
  const { user: currentUser } = useAuth()
  const { data, loading, pending, setUserStatus } = useCampusData()
  const users = useMemo(() => (data?.users ?? []).filter((user) => role === 'all' || user.role === role).filter((user) => status === 'all' || user.status === status).filter((user) => !query.trim() || [user.fullName, user.email, user.department].some((value) => value.toLowerCase().includes(query.trim().toLowerCase()))).sort((a, b) => a.fullName.localeCompare(b.fullName)), [data?.users, query, role, status])
  if (loading) return <LoadingState label="Loading user accounts…" />
  const exportCsv = () => {
    const rows = [['Name', 'Email', 'Role', 'Department', 'Status', 'Created'], ...users.map((user) => [user.fullName, user.email, user.role, user.department, user.status, user.createdAt])]
    const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'campusconnect-users.csv'; anchor.click(); URL.revokeObjectURL(url)
  }

  return <div><PageHeader eyebrow="Account management" title="Users and permissions" description="Review student and organizer accounts, monitor status, and suspend access when required." actions={<Button variant="outline" onClick={exportCsv} disabled={!users.length}><Download className="size-4" />Export users</Button>} />
    <div className="mb-6 grid gap-3 rounded-xl border bg-white p-4 shadow-card lg:grid-cols-[1fr_190px_190px]"><div className="relative"><Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input className="pl-10" placeholder="Search name, email, or department…" value={query} onChange={(event) => setQuery(event.target.value)} /></div><Select value={role} onChange={(event) => setRole(event.target.value)}><option value="all">All roles</option><option value="student">Students</option><option value="organizer">Organizers</option><option value="admin">Administrators</option></Select><Select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option><option value="active">Active</option><option value="suspended">Suspended</option></Select></div>
    <Card><CardContent className="p-0">{users.length ? <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left"><thead><tr className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><th className="px-5 py-3 font-semibold">User</th><th className="px-5 py-3 font-semibold">Role</th><th className="px-5 py-3 font-semibold">Department</th><th className="px-5 py-3 font-semibold">Joined</th><th className="px-5 py-3 font-semibold">Status</th><th className="px-5 py-3 text-right font-semibold">Action</th></tr></thead><tbody>{users.map((user) => <tr key={user.id} className="border-b last:border-0 hover:bg-slate-50/70"><td className="px-5 py-4"><div className="flex items-center gap-3"><Avatar src={user.avatarUrl} name={user.fullName} /><div><p className="text-sm font-bold text-navy-900">{user.fullName}</p><p className="text-xs text-slate-500">{user.email}</p></div></div></td><td className="px-5 py-4"><Badge variant={user.role === 'admin' ? 'navy' : user.role === 'organizer' ? 'default' : 'secondary'} className="capitalize">{user.role === 'admin' && <ShieldCheck className="mr-1 size-3" />}{user.role}</Badge></td><td className="px-5 py-4 text-sm text-slate-600">{user.department}</td><td className="px-5 py-4 text-sm text-slate-600">{formatDate(user.createdAt)}</td><td className="px-5 py-4"><Badge variant={user.status === 'active' ? 'success' : 'destructive'} className="capitalize">{user.status}</Badge></td><td className="px-5 py-4 text-right">{user.id === currentUser?.id ? <span className="text-xs font-medium text-slate-400">Current account</span> : <Button size="sm" variant={user.status === 'active' ? 'outline' : 'default'} onClick={() => void setUserStatus(user.id, user.status === 'active' ? 'suspended' : 'active').catch(() => undefined)} disabled={pending === `user:${user.id}`}>{user.status === 'active' ? <UserRoundX className="size-3.5" /> : <UserCheck className="size-3.5" />}{user.status === 'active' ? 'Suspend' : 'Activate'}</Button>}</td></tr>)}</tbody></table></div> : <div className="p-6"><EmptyState icon={Users} title="No user accounts found" description="Adjust your search or account filters." /></div>}</CardContent></Card>
  </div>
}
