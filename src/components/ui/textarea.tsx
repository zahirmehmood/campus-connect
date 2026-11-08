import * as React from 'react'
import { cn } from '@/lib/utils'

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn('focus-ring flex min-h-28 w-full resize-y rounded-lg border border-input bg-white px-3.5 py-3 text-sm text-navy-900 shadow-sm transition placeholder:text-slate-400 focus:border-brand-400 disabled:cursor-not-allowed disabled:opacity-50', className)}
      {...props}
    />
  ),
)
Textarea.displayName = 'Textarea'
