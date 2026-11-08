import { useState, type FormEvent } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, LoaderCircle, MailCheck, RefreshCw, UserPlus } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { isMockMode } from '@/config/env'
import { useAuth } from '@/context/auth-context'
import { useToast } from '@/context/toast-context'

export function RegisterPage() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', department: '', academicYear: 'Year 1' })
  const [confirmationEmail, setConfirmationEmail] = useState('')
  const [confirmationCode, setConfirmationCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const { signUp, confirmSignUp, resendSignUpCode } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const update = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }))

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const passwordValid = isMockMode
      ? form.password.length >= 8
      : form.password.length >= 12 && /[a-z]/.test(form.password) && /[A-Z]/.test(form.password) && /\d/.test(form.password) && /[^A-Za-z0-9]/.test(form.password)
    if (form.fullName.trim().length < 2 || !form.department.trim() || !/^[^\s@]+@[^\s@]+\.edu$/i.test(form.email) || !passwordValid) {
      showToast({ title: 'Check your details', description: isMockMode ? 'Use a .edu email, complete every field, and choose at least 8 password characters.' : 'Use a .edu email and a 12-character password with uppercase, lowercase, number, and symbol.', tone: 'error' })
      return
    }
    setSubmitting(true)
    try {
      const result = await signUp(form)
      if (result.status === 'confirmation-required') {
        setConfirmationEmail(result.email)
        showToast({ title: 'Check your university email', description: 'Enter the Cognito verification code to finish registration.', tone: 'info' })
      } else {
        showToast({ title: 'Your student account is ready', description: 'Welcome to CampusConnect.', tone: 'success' })
        navigate('/dashboard', { replace: true })
      }
    } catch (error) {
      showToast({ title: 'Account not created', description: error instanceof Error ? error.message : 'Please try again.', tone: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const confirm = async (event: FormEvent) => {
    event.preventDefault()
    if (!confirmationCode.trim()) {
      showToast({ title: 'Enter your verification code', tone: 'error' })
      return
    }
    setSubmitting(true)
    try {
      await confirmSignUp(confirmationEmail, confirmationCode, form.password)
      showToast({ title: 'Email confirmed', description: 'Your CampusConnect account is ready.', tone: 'success' })
      navigate('/dashboard', { replace: true })
    } catch (error) {
      showToast({ title: 'Code not accepted', description: error instanceof Error ? error.message : 'Request a new code and try again.', tone: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const resend = async () => {
    setResending(true)
    try {
      await resendSignUpCode(confirmationEmail)
      showToast({ title: 'A new code was sent', tone: 'success' })
    } catch (error) {
      showToast({ title: 'Code not sent', description: error instanceof Error ? error.message : 'Try again shortly.', tone: 'error' })
    } finally {
      setResending(false)
    }
  }

  return (
    <section className="bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,.12),transparent_38%)] py-12 sm:py-16">
      <div className="container-shell grid items-start gap-10 lg:grid-cols-[.85fr_1.15fr]">
        <div className="max-w-lg pt-8 lg:sticky lg:top-28 lg:pt-14">
          <span className="eyebrow"><UserPlus className="size-3.5" />Student access</span>
          <h1 className="text-4xl font-extrabold leading-tight text-navy-950 sm:text-5xl">A better campus experience starts here.</h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-600">Create one profile for events, communities, workshops, and the updates that matter to you.</p>
          <ul className="mt-8 space-y-4">{['Reserve event places in seconds', 'Build your community network', 'Keep opportunities in one dashboard'].map((item) => <li key={item} className="flex items-center gap-3 text-sm font-semibold text-slate-700"><CheckCircle2 className="size-5 text-emerald-600" />{item}</li>)}</ul>
        </div>
        <Card className="mx-auto w-full max-w-2xl shadow-soft">
          <CardContent className="p-6 sm:p-8">
            {confirmationEmail ? (
              <>
                <div className="text-center"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-700"><MailCheck className="size-7" /></span><p className="mt-5 text-sm font-bold text-brand-700">Verify your email</p><h2 className="mt-1 text-2xl font-extrabold text-navy-950">Enter your confirmation code</h2><p className="mt-2 text-sm text-slate-500">Amazon Cognito sent a code to <strong>{confirmationEmail}</strong>.</p></div>
                <form onSubmit={confirm} className="mx-auto mt-7 max-w-sm space-y-5"><div className="space-y-2"><Label htmlFor="confirmation-code">Verification code</Label><Input id="confirmation-code" inputMode="numeric" autoComplete="one-time-code" value={confirmationCode} onChange={(event) => setConfirmationCode(event.target.value)} placeholder="Enter the code" className="text-center text-lg tracking-[0.25em]" /></div><Button type="submit" size="lg" className="w-full" disabled={submitting}>{submitting ? <LoaderCircle className="size-4 animate-spin" /> : <MailCheck className="size-4" />}{submitting ? 'Confirming…' : 'Confirm and sign in'}</Button><div className="flex items-center justify-between gap-3"><Button type="button" variant="ghost" size="sm" onClick={() => { setConfirmationEmail(''); setConfirmationCode('') }}><ArrowLeft className="size-3.5" />Edit details</Button><Button type="button" variant="ghost" size="sm" onClick={() => void resend()} disabled={resending}>{resending && <RefreshCw className="size-3.5 animate-spin" />}Resend code</Button></div></form>
              </>
            ) : (
              <>
                <div><p className="text-sm font-bold text-brand-700">Create account</p><h2 className="mt-1 text-2xl font-extrabold text-navy-950">Join CampusConnect</h2><p className="mt-2 text-sm text-slate-500">Public registration always creates a student role.</p></div>
                <form onSubmit={submit} className="mt-7 grid gap-5 sm:grid-cols-2" noValidate>
                  <div className="space-y-2 sm:col-span-2"><Label htmlFor="fullName">Full name</Label><Input id="fullName" autoComplete="name" value={form.fullName} onChange={(event) => update('fullName', event.target.value)} placeholder="Your full name" /></div>
                  <div className="space-y-2 sm:col-span-2"><Label htmlFor="email">University email</Label><Input id="email" type="email" autoComplete="email" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="you@university.edu" /><p className="text-xs text-slate-500">University email addresses ending in .edu are accepted by the local demo.</p></div>
                  <div className="space-y-2"><Label htmlFor="department">Department</Label><Input id="department" value={form.department} onChange={(event) => update('department', event.target.value)} placeholder="Computer Science" /></div>
                  <div className="space-y-2"><Label htmlFor="academicYear">Academic year</Label><Select id="academicYear" value={form.academicYear} onChange={(event) => update('academicYear', event.target.value)}><option>Year 1</option><option>Year 2</option><option>Year 3</option><option>Year 4</option><option>Postgraduate</option><option>Doctoral</option></Select></div>
                  <div className="space-y-2 sm:col-span-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" autoComplete="new-password" value={form.password} onChange={(event) => update('password', event.target.value)} placeholder={isMockMode ? 'At least 8 characters' : '12+ characters with mixed types'} /><p className="text-xs text-slate-500">{isMockMode ? 'Use at least 8 characters.' : 'Use 12+ characters with uppercase, lowercase, a number, and a symbol.'}</p></div>
                  <div className="sm:col-span-2"><Button type="submit" size="lg" className="w-full" disabled={submitting}>{submitting ? <LoaderCircle className="size-4 animate-spin" /> : <UserPlus className="size-4" />}{submitting ? 'Creating account…' : 'Create student account'}{!submitting && <ArrowRight className="size-4" />}</Button></div>
                </form>
                <p className="mt-6 text-center text-sm text-slate-600">Already have an account? <Link to="/login" className="font-bold text-brand-700 hover:underline">Sign in</Link></p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
