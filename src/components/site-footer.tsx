import { Github, Linkedin, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BrandLogo } from '@/components/brand-logo'

const groups = [
  { title: 'Explore', links: [['Events', '/events'], ['Communities', '/communities'], ['Announcements', '/announcements']] },
  { title: 'CampusConnect', links: [['Student dashboard', '/dashboard'], ['Organizer portal', '/organizer'], ['Admin portal', '/admin']] },
]

export function SiteFooter() {
  return (
    <footer className="border-t bg-navy-950 text-slate-300">
      <div className="container-shell grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div className="max-w-sm">
          <BrandLogo light />
          <p className="mt-4 text-sm leading-relaxed text-slate-400">One trusted place to discover what is happening, meet your people, and make more of university life.</p>
          <div className="mt-5 flex gap-2">
            <a href="mailto:campusconnect@example.edu" className="focus-ring rounded-lg border border-white/10 p-2.5 hover:bg-white/10" aria-label="Email CampusConnect"><Mail className="size-4" /></a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="focus-ring rounded-lg border border-white/10 p-2.5 hover:bg-white/10" aria-label="GitHub"><Github className="size-4" /></a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="focus-ring rounded-lg border border-white/10 p-2.5 hover:bg-white/10" aria-label="LinkedIn"><Linkedin className="size-4" /></a>
          </div>
        </div>
        {groups.map((group) => (
          <div key={group.title}>
            <h3 className="text-sm font-bold text-white">{group.title}</h3>
            <ul className="mt-4 space-y-3">
              {group.links.map(([label, to]) => <li key={label}><Link to={to} className="text-sm text-slate-400 hover:text-white">{label}</Link></li>)}
            </ul>
          </div>
        ))}
        <div>
          <h3 className="text-sm font-bold text-white">Built for campus</h3>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">Demo data is clearly separated from the AWS service adapter and can be reset at any time.</p>
          <Link to="/login" className="mt-4 inline-block text-sm font-bold text-brand-300 hover:text-white">Open demo access →</Link>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-shell flex flex-col gap-2 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} CampusConnect. Student-built cloud project.</p>
          <p>Privacy-minded · Accessible · AWS-ready</p>
        </div>
      </div>
    </footer>
  )
}
