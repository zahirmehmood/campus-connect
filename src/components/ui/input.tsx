import * as React from 'react'
import { cn } from '@/lib/utils'

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn('focus-ring flex h-11 w-full rounded-lg border border-input bg-white px-3.5 py-2 text-sm text-navy-900 shadow-sm transition placeholder:text-slate-400 focus:border-brand-400 disabled:cursor-not-allowed disabled:opacity-50', className)}
      {...props}
    />
  ),
)
Input.displayName = 'Input'
