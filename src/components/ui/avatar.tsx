import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { cn, initials } from '@/lib/utils'

interface AvatarProps {
  src?: string
  name: string
  className?: string
}

export function Avatar({ src, name, className }: AvatarProps) {
  return (
    <AvatarPrimitive.Root className={cn('inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white bg-brand-100 shadow-sm', className)}>
      {src && <AvatarPrimitive.Image src={src} alt={`${name} profile`} className="size-full object-cover" />}
      <AvatarPrimitive.Fallback className="flex size-full items-center justify-center bg-brand-100 text-xs font-bold text-brand-800" delayMs={300}>
        {initials(name)}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
}
