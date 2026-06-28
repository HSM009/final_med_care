import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        // ✅ Direct inline style injections that bypass production compiler stripping
        style: {
          borderRadius: 'var(--radius)',
        },
        classNames: {
          toast:
            'group border border-solid bg-[var(--popover)] text-[var(--popover-foreground)] border-[var(--border)]',
          closeButton: '!right-0 !left-auto !translate-x-1/2 !bg-transparent',

          success:
            '!bg-[color-mix(in_oklab,light-dark(#16a34a,#4ade80)_10%,var(--background))] !text-[light-dark(#16a34a,#4ade80)] !border-[light-dark(#16a34a,#4ade80)]',
          info: '!bg-[color-mix(in_oklab,light-dark(#0284c7,#38bdf8)_10%,var(--background))] !text-[light-dark(#0284c7,#38bdf8)] !border-[light-dark(#0284c7,#38bdf8)]',
          warning:
            '!bg-[color-mix(in_oklab,light-dark(#d97706,#fbbf24)_10%,var(--background))] !text-[light-dark(#d97706,#fbbf24)] !border-[light-dark(#d97706,#fbbf24)]',
          error:
            '!bg-[color-mix(in_oklab,var(--destructive)_10%,var(--background))] !text-[var(--destructive)] !border-[var(--destructive)]',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
