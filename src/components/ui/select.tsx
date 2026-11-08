import * as React from 'react'
import { cn } from '@/lib/utils'

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn('focus-ring flex h-11 w-full appearance-none rounded-lg border border-input bg-white px-3.5 py-2 text-sm text-navy-900 shadow-sm transition focus:border-brand-400 disabled:cursor-not-allowed disabled:opacity-50', className)}
      {...props}
    >
      {children}
    </select>
  ),
)
Select.displayName = 'Select'
