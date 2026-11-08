import { ArrowLeft, Compass } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return <section className="container-shell flex min-h-[65vh] items-center justify-center py-16"><div className="max-w-lg text-center"><p className="font-display text-7xl font-extrabold text-brand-200">404</p><h1 className="mt-2 text-3xl font-extrabold text-navy-950">This campus path is empty</h1><p className="mt-3 text-slate-600">The page may have moved, or the link may no longer be active.</p><div className="mt-7 flex justify-center gap-3"><Button asChild variant="outline"><Link to="/"><ArrowLeft className="size-4" />Home</Link></Button><Button asChild><Link to="/events"><Compass className="size-4" />Explore events</Link></Button></div></div></section>
}
