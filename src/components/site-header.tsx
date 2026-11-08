import { useState } from 'react'
import { Bell, LayoutDashboard, LogOut, Menu, UserRound, X } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BrandLogo } from '@/components/brand-logo'
import { useAuth } from '@/context/auth-context'
import { useCampusData } from '@/context/data-context'
import { cn } from '@/lib/utils'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/events', label: 'Events' },
  { to: '/communities', label: 'Communities' },
  { to: '/announcements', label: 'Announcements' },
]

export function dashboardPath(role?: string) {
  if (role === 'organizer') return '/organizer'
  if (role === 'admin') return '/admin'
  return '/dashboard'
}

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const { user, signOut } = useAuth()
  const { data } = useCampusData()
  const navigate = useNavigate()
  const unread = user ? data?.notifications.filter((item) => item.userId === user.id && !item.readAt).length ?? 0 : 0

  const logout = async () => {
    await signOut()
    setOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur-xl">
      <div className="container-shell flex h-16 items-center justify-between gap-6">
        <BrandLogo />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => cn('focus-ring rounded-lg px-3.5 py-2 text-sm font-semibold transition', isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-navy-900')}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <>
              <Link to={dashboardPath(user.role)} className="focus-ring relative rounded-lg p-2.5 text-slate-500 hover:bg-slate-100 hover:text-navy-900" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}>
                <Bell className="size-5" />
                {unread > 0 && <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-brand-600 ring-2 ring-white" />}
              </Link>
              <Button asChild variant="outline"><Link to={dashboardPath(user.role)}><LayoutDashboard className="size-4" />Dashboard</Link></Button>
              <Link to="/profile" className="focus-ring ml-1 flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-slate-50">
                <Avatar src={user.avatarUrl} name={user.fullName} className="size-8" />
                <span className="max-w-28 truncate text-sm font-semibold text-navy-900">{user.fullName.split(' ')[0]}</span>
              </Link>
            </>
          ) : (
            <>
              <Button asChild variant="ghost"><Link to="/login">Sign in</Link></Button>
              <Button asChild><Link to="/register">Join CampusConnect</Link></Button>
            </>
          )}
        </div>
        <button type="button" className="focus-ring rounded-lg p-2 text-navy-900 lg:hidden" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label="Toggle navigation">
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>
      {open && (
        <div className="border-t bg-white px-4 py-4 lg:hidden">
          <nav className="container-shell flex flex-col gap-1" aria-label="Mobile navigation">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} onClick={() => setOpen(false)} className={({ isActive }) => cn('rounded-lg px-3 py-2.5 text-sm font-semibold', isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-50')}>
                {link.label}
              </NavLink>
            ))}
            <div className="my-2 border-t" />
            {user ? (
              <>
                <div className="mb-2 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <Avatar src={user.avatarUrl} name={user.fullName} />
                  <div><p className="text-sm font-bold text-navy-900">{user.fullName}</p><Badge variant="secondary" className="mt-1 capitalize">{user.role}</Badge></div>
                </div>
                <Link to={dashboardPath(user.role)} onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><LayoutDashboard className="size-4" />Dashboard</Link>
                <Link to="/profile" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><UserRound className="size-4" />Profile</Link>
                <button type="button" onClick={logout} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50"><LogOut className="size-4" />Sign out</button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3"><Button asChild variant="outline"><Link to="/login" onClick={() => setOpen(false)}>Sign in</Link></Button><Button asChild><Link to="/register" onClick={() => setOpen(false)}>Join now</Link></Button></div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
