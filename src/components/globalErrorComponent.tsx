import { AlertTriangle, RefreshCw } from 'lucide-react'
import { buttonVariants } from './ui/button'
import { type ErrorComponentProps } from '@tanstack/react-router'
import { cn } from '#/lib/utils'
import { queryClient } from '#/lib/query-client'

export function GlobalErrorComponent({ error, reset }: ErrorComponentProps) {
  const isNetworkError =
    error instanceof TypeError ||
    error?.message?.toLowerCase().includes('fetch') ||
    error?.message?.toLowerCase().includes('connection')

  if (isNetworkError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background text-foreground">
        <div className="w-full max-w-md rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-center shadow-lg backdrop-blur-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            Server Unreachable
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            We lost connection to the server. Your backend dev server may have
            crashed, or your internet connection dropped.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={() => {
                queryClient.clear()
                reset()
                window.location.reload()
              }}
              className={cn(buttonVariants({ variant: 'default' }), 'gap-2')}
            >
              <RefreshCw className="h-4 w-4" />
              Reconnect Now
            </button>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background text-foreground">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-center shadow-lg">
        <h2 className="text-xl font-bold text-destructive">
          Something went wrong
        </h2>
        <p className="mt-2 text-sm text-muted-foreground wrap-break-word font-mono bg-muted p-3 rounded-lg border">
          {error?.message || 'An unknown error occurred.'}
        </p>
        <button
          onClick={() => reset()}
          className={cn(
            buttonVariants({ variant: 'secondary' }),
            'mt-4 w-full',
          )}
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
