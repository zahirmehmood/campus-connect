import { useState, type FormEvent } from 'react'
import { ArrowRight, LoaderCircle, LockKeyhole, ShieldCheck } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { DEMO_ACCOUNTS } from '@/data/seed'
import { dashboardPath } from '@/components/site-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/auth-context'
import { useToast } from '@/context/toast-context'

export function LoginPage() {
  const [email, setEmail] = useState('aisha.khan@campus.edu')
  const [password, setPassword] = useState('demo123')
  const [submitting, setSubmitting] = useState(false)
  const { signIn } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!email.trim() || !password) {
      showToast({ title: 'Enter your email and password', tone: 'error' })
      return
    }
    setSubmitting(true)
    try {
      const user = await signIn(email, password)
      showToast({ title: `Welcome back, ${user.fullName.split(' ')[0]}`, tone: 'success' })
      const requested = (location.state as { from?: string } | null)?.from
      navigate(requested ?? dashboardPath(user.role), { replace: true })
    } catch (error) {
      showToast({ title: 'Sign in failed', description: error instanceof Error ? error.message : 'Check your details and try again.', tone: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const chooseDemo = (account: typeof DEMO_ACCOUNTS[number]) => {
    setEmail(account.email)
    setPassword(account.password)
  }

  return (
    <section className="bg-[radial-gradient(circle_at_top_left,rgba(53,149,252,.14),transparent_35%)] py-12 sm:py-16">
      <div className="container-shell grid items-start gap-10 lg:grid-cols-[.9fr_1.1fr]">
        <div className="max-w-lg pt-4 lg:sticky lg:top-28 lg:pt-12">
          <Badge className="mb-5"><ShieldCheck className="mr-1.5 size-3.5" />Secure campus access</Badge>
          <h1 className="text-4xl font-extrabold leading-tight text-navy-950 sm:text-5xl">Welcome back to your campus hub.</h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-600">Sign in to manage registrations, follow your communities, and see recommendations shaped around your interests.</p>
          <div className="mt-8 rounded-xl border bg-white/80 p-5 shadow-card backdrop-blur">
            <div className="flex gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700"><LockKeyhole className="size-5" /></span><div><p className="font-bold text-navy-900">Local demo mode</p><p className="mt-1 text-sm leading-relaxed text-slate-600">These sample accounts are isolated browser data. Production mode delegates credentials to Amazon Cognito.</p></div></div>
          </div>
        </div>
        <Card className="mx-auto w-full max-w-xl overflow-hidden shadow-soft">
          <CardContent className="p-6 sm:p-8">
            <div><p className="text-sm font-bold text-brand-700">Sign in</p><h2 className="mt-1 text-2xl font-extrabold text-navy-950">Continue to CampusConnect</h2><p className="mt-2 text-sm text-slate-500">Use your university account or select a demo role.</p></div>
            <div className="mt-6 grid gap-2 sm:grid-cols-3">
              {DEMO_ACCOUNTS.map((account) => <button type="button" key={account.role} onClick={() => chooseDemo(account)} className={`focus-ring rounded-xl border p-3 text-left transition hover:border-brand-300 hover:bg-brand-50 ${email === account.email ? 'border-brand-400 bg-brand-50 ring-1 ring-brand-200' : 'bg-white'}`}><p className="text-xs font-bold text-brand-700">{account.role}</p><p className="mt-1 truncate text-[11px] text-slate-500">{account.email}</p></button>)}
            </div>
            <div className="my-6 flex items-center gap-3"><div className="h-px flex-1 bg-border" /><span className="text-xs font-medium text-slate-400">ACCOUNT DETAILS</span><div className="h-px flex-1 bg-border" /></div>
            <form onSubmit={submit} className="space-y-5" noValidate>
              <div className="space-y-2"><Label htmlFor="email">University email</Label><Input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@campus.edu" /></div>
              <div className="space-y-2"><div className="flex items-center justify-between"><Label htmlFor="password">Password</Label><span className="text-xs text-slate-400">Demo: demo123</span></div><Input id="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} /></div>
              <Button type="submit" size="lg" className="w-full" disabled={submitting}>{submitting ? <LoaderCircle className="size-4 animate-spin" /> : <LockKeyhole className="size-4" />}{submitting ? 'Signing in…' : 'Sign in'}{!submitting && <ArrowRight className="size-4" />}</Button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-600">New to CampusConnect? <Link to="/register" className="font-bold text-brand-700 hover:underline">Create a student account</Link></p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
