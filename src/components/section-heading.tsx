import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

interface SectionHeadingProps {
  eyebrow?: string
  title: string
  description?: string
  link?: { label: string; to: string }
}

export function SectionHeading({ eyebrow, title, description, link }: SectionHeadingProps) {
  return (
    <div className="mb-8 flex items-end justify-between gap-6">
      <div className="max-w-2xl">
        {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-brand-700">{eyebrow}</p>}
        <h2 className="text-2xl font-extrabold text-navy-950 sm:text-3xl">{title}</h2>
        {description && <p className="mt-2 text-slate-600">{description}</p>}
      </div>
      {link && <Link to={link.to} className="focus-ring hidden shrink-0 items-center gap-1.5 rounded-md text-sm font-bold text-brand-700 hover:text-brand-800 sm:flex">{link.label}<ArrowRight className="size-4" /></Link>}
    </div>
  )
}
