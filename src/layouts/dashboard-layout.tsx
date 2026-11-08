import { useState } from 'react'
import {
  Bell, CalendarDays, ChevronDown, CircleGauge, ClipboardList, ExternalLink, FilePlus2,
  House, LogOut, Megaphone, Menu, RotateCcw, Settings2, ShieldCheck, UserRound, UsersRound, X,
} from 'lucide-react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BrandLogo } from '@/components/brand-logo'
import { useAuth } from '@/context/auth-context'
import { useCampusData } from '@/context/data-context'
import { isMockMode } from '@/config/env'
import { cn, relativeTime } from '@/lib/utils'

const navigation = {
  student: [
    { to: '/dashboard', label: 'Overview', icon: CircleGauge },
    { to: '/my-events', label: 'My events', icon: CalendarDays },
    { to: '/my-communities', label: 'My communities', icon: UsersRound },
    { to: '/events', label: 'Explore events', icon: ClipboardList },
    { to: '/announcements', label: 'Announcements', icon: Megaphone },
    { to: '/profile', label: 'My profile', icon: UserRound },
  ],
  organizer: [
    { to: '/organizer', label: 'Overview', icon: CircleGauge },
    { to: '/organizer/events', label: 'Manage events', icon: CalendarDays },
    { to: '/organizer/events/new', label: 'Create event', icon: FilePlus2 },
    { to: '/organizer/announcements/new', label: 'Publish update', icon: Megaphone },
    { to: '/profile', label: 'My profile', icon: UserRound },
  ],
  admin: [
    { to: '/admin', label: 'Overview', icon: CircleGauge },
    { to: '/admin/users', label: 'User accounts', icon: UserRound },
    { to: '/admin/communities', label: 'Societies', icon: UsersRound },
    { to: '/admin/content', label: 'Content', icon: ShieldCheck },
    { to: '/profile', label: 'My profile', icon: Settings2 },
  ],
}

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const { user, signOut } = useAuth()
  const { data, pending, resetDemoData } = useCampusData()
  const navigate = useNavigate()
  if (!user) return null

  const links = navigation[user.role]
  const notifications = data?.notifications.filter((item) => item.userId === user.id).slice(0, 5) ?? []
  const unread = notifications.filter((item) => !item.readAt).length

  const logout = async () => {
    await signOut()
    navigate('/')
  }

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b px-5">
        <BrandLogo />
        {mobile && <button type="button" className="rounded-lg p-2" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X className="size-5" /></button>}
      </div>
      <div className="px-4 py-5">
        <div className="flex items-center gap-3 rounded-xl bg-gradient-to-br from-brand-50 to-indigo-50 p-3">
          <Avatar src={user.avatarUrl} name={user.fullName} />
          <div className="min-w-0"><p className="truncate text-sm font-bold text-navy-950">{user.fullName}</p><Badge variant="default" className="mt-1 capitalize">{user.role}</Badge></div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3" aria-label={`${user.role} dashboard`}>
        {links.map((item) => {
          const Icon = item.icon
          return <NavLink key={item.to} to={item.to} end={item.to === '/dashboard' || item.to === '/organizer' || item.to === '/admin'} onClick={() => setMobileOpen(false)} className={({ isActive }) => cn('focus-ring flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition', isActive ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-navy-900')}><Icon className="size-4.5" />{item.label}</NavLink>
        })}
      </nav>
      <div className="space-y-2 border-t p-4">
        {isMockMode && <Button type="button" variant="ghost" className="w-full justify-start text-slate-600" onClick={() => void resetDemoData()} disabled={pending === 'reset'}><RotateCcw className={cn('size-4', pending === 'reset' && 'animate-spin')} />Reset demo data</Button>}
        <Button type="button" variant="ghost" className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700" onClick={logout}><LogOut className="size-4" />Sign out</Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r bg-white lg:block"><Sidebar /></aside>
      {mobileOpen && <><button type="button" aria-label="Close navigation overlay" className="fixed inset-0 z-40 bg-navy-950/40 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} /><aside className="fixed inset-y-0 left-0 z-50 w-[85vw] max-w-72 bg-white shadow-2xl lg:hidden"><Sidebar mobile /></aside></>}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button type="button" className="focus-ring rounded-lg p-2 text-navy-900 hover:bg-slate-100 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu className="size-5" /></button>
            <div className="hidden sm:block"><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">CampusConnect</p><p className="text-sm font-bold text-navy-900">{user.role === 'admin' ? 'Administration' : user.role === 'organizer' ? 'Organizer workspace' : 'Student hub'}</p></div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex"><Link to="/"><House className="size-4" />View site<ExternalLink className="size-3" /></Link></Button>
            <div className="relative">
              <button type="button" onClick={() => setNotificationsOpen((value) => !value)} className="focus-ring relative rounded-lg p-2.5 text-slate-500 hover:bg-slate-100 hover:text-navy-900" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`} aria-expanded={notificationsOpen}>
                <Bell className="size-5" />
                {unread > 0 && <span className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-brand-600 text-[9px] font-bold text-white ring-2 ring-white">{unread}</span>}
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 top-12 w-[min(88vw,360px)] overflow-hidden rounded-xl border bg-white shadow-soft">
                  <div className="flex items-center justify-between border-b px-4 py-3"><h3 className="text-sm font-bold text-navy-900">Notifications</h3><Badge variant="secondary">{unread} unread</Badge></div>
                  <div className="max-h-80 overflow-auto">
                    {notifications.length ? notifications.map((item) => (
                      <Link key={item.id} to={item.link ?? '#'} onClick={() => setNotificationsOpen(false)} className="block border-b px-4 py-3 last:border-0 hover:bg-slate-50">
                        <div className="flex gap-3"><span className={cn('mt-1 size-2 shrink-0 rounded-full', item.readAt ? 'bg-slate-200' : 'bg-brand-600')} /><div><p className="text-sm font-semibold text-navy-900">{item.title}</p><p className="mt-0.5 text-xs leading-relaxed text-slate-500">{item.message}</p><p className="mt-1 text-[11px] text-slate-400">{relativeTime(item.createdAt)}</p></div></div>
                      </Link>
                    )) : <p className="px-4 py-8 text-center text-sm text-slate-500">No notifications yet.</p>}
                  </div>
                </div>
              )}
            </div>
            <Link to="/profile" className="focus-ring flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-100"><Avatar src={user.avatarUrl} name={user.fullName} className="size-8" /><ChevronDown className="hidden size-3.5 text-slate-400 sm:block" /></Link>
          </div>
        </header>
        <main className="mx-auto max-w-[1400px] p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  )
}
