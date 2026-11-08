import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'

export function PublicLayout() {
  const location = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [location.pathname])
  return <div className="flex min-h-screen flex-col"><SiteHeader /><main className="flex-1"><Outlet /></main><SiteFooter /></div>
}
