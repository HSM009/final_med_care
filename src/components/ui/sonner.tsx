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
        classNames: {
          /* ⚡️ The `group-[.toaster]` layout targets force variables through Sonner's native priority engine */
          toast:
            'group-[.toaster]:border group-[.toaster]:border-solid group-[.toaster]:bg-[var(--popover)] group-[.toaster]:text-[var(--popover-foreground)] group-[.toaster]:border-[var(--border)] group-[.toaster]:rounded-[var(--radius)]',
          closeButton:
            'group-[.toaster]:!right-0 group-[.toaster]:!left-auto group-[.toaster]:!translate-x-1/2 group-[.toaster]:!bg-transparent',

          /* 🎨 Variant states targeted securely using CSS attribute modifiers matching Sonner's structure */
          success:
            'group-[[data-type=success]]:!bg-[color-mix(in_oklab,light-dark(#16a34a,#4ade80)_10%,var(--background))] group-[[data-type=success]]:!text-[light-dark(#16a34a,#4ade80)] group-[[data-type=success]]:!border-[light-dark(#16a34a,#4ade80)]',
          info: 'group-[[data-type=info]]:!bg-[color-mix(in_oklab,light-dark(#0284c7,#38bdf8)_10%,var(--background))] group-[[data-type=info]]:!text-[light-dark(#0284c7,#38bdf8)] group-[[data-type=info]]:!border-[light-dark(#0284c7,#38bdf8)]',
          warning:
            'group-[[data-type=warning]]:!bg-[color-mix(in_oklab,light-dark(#d97706,#fbbf24)_10%,var(--background))] group-[[data-type=warning]]:!text-[light-dark(#d97706,#fbbf24)] group-[[data-type=warning]]:!border-[light-dark(#d97706,#fbbf24)]',
          error:
            'group-[[data-type=error]]:!bg-[color-mix(in_oklab,var(--destructive)_10%,var(--background))] group-[[data-type=error]]:!text-[var(--destructive)] group-[[data-type=error]]:!border-[var(--destructive)]',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
