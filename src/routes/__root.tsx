import {
  HeadContent,
  Link,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '#/components/ui/sonner'
import { ThemeProvider } from '#/lib/theme-provider'

import appCss from '../styles.css?url'
import { buttonVariants } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import { GlobalErrorComponent } from '#/components/globalErrorComponent'
import { queryClient } from '#/lib/query-client'
import { getSessionFn } from '#/data/session'
import { createAuthContext } from '#/lib/auth-injectors'
import type { AuthContextResult, AuthUser } from '#/lib/types'
import { AfkMonitor } from '#/components/afk-monitor'
import type { Roles } from '#/generated/prisma/enums'
import { ConfirmProvider } from '#/hooks/confirm-context'
import { GlobalConfirmDialog } from '#/components/web/confirmationDialog'

export interface MyRouterContext {
  queryClient: QueryClient
  auth: AuthContextResult
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async () => {
    const session = await getSessionFn()
    return createAuthContext(session)
  },

  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'HSM Tanstack App',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
  errorComponent: GlobalErrorComponent,
  notFoundComponent: () => {
    return (
      <div>
        <p className=" p-4 text-primary ">Page Not found :( </p>
        <Link
          className={cn(
            ' block ml-4 mt-4 ',
            buttonVariants({ variant: 'default' }),
          )}
          to="/"
        >
          Go home page
        </Link>
      </div>
    )
  },
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const { auth } = Route.useRouteContext()
  const userRole = auth.user?.role as Roles
  const authUser = auth.user as AuthUser
  return (
    <QueryClientProvider client={queryClient}>
      <html lang="en" suppressHydrationWarning>
        <head>
          <HeadContent />
        </head>
        <body>
          <ThemeProvider>
            <ConfirmProvider>
              <AfkMonitor type={userRole} user={authUser}>
                {children}
              </AfkMonitor>
              <Toaster
                position="top-center"
                toastOptions={{
                  classNames: {
                    closeButton: '!right-0 !left-auto !translate-x-1/2',
                  },
                }}
              />
              <GlobalConfirmDialog />
            </ConfirmProvider>
          </ThemeProvider>
          <Scripts />
        </body>
      </html>
    </QueryClientProvider>
  )
}
