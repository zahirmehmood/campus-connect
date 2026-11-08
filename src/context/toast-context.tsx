import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { CheckCircle2, CircleAlert, Info, X } from 'lucide-react'
import { cn, uniqueId } from '@/lib/utils'

type ToastTone = 'success' | 'error' | 'info'
interface ToastMessage { id: string; title: string; description?: string; tone: ToastTone }
interface ToastContextValue { showToast: (toast: Omit<ToastMessage, 'id'>) => void }

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([])

  const dismiss = useCallback((id: string) => {
    setMessages((current) => current.filter((message) => message.id !== id))
  }, [])

  const showToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = uniqueId('toast')
    setMessages((current) => [...current.slice(-2), { ...toast, id }])
    window.setTimeout(() => dismiss(id), 4500)
  }, [dismiss])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 top-4 z-[100] flex flex-col items-end gap-3 sm:left-auto sm:w-[390px]" aria-live="polite">
        {messages.map((message) => {
          const Icon = message.tone === 'success' ? CheckCircle2 : message.tone === 'error' ? CircleAlert : Info
          return (
            <div key={message.id} className="pointer-events-auto flex w-full animate-fade-up items-start gap-3 rounded-xl border bg-white p-4 shadow-soft">
              <span className={cn('mt-0.5 grid size-8 shrink-0 place-items-center rounded-full', message.tone === 'success' && 'bg-emerald-100 text-emerald-700', message.tone === 'error' && 'bg-red-100 text-red-700', message.tone === 'info' && 'bg-brand-100 text-brand-700')}>
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-navy-900">{message.title}</p>
                {message.description && <p className="mt-0.5 text-sm leading-relaxed text-slate-600">{message.description}</p>}
              </div>
              <button type="button" onClick={() => dismiss(message.id)} className="focus-ring rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Dismiss message">
                <X className="size-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside ToastProvider')
  return context
}
