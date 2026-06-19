import {
  HeadContent,
  Link,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '#/components/ui/sonner'
import { ThemeProvider } from '#/lib/theme-provider'

import appCss from '../styles.css?url'
import { buttonVariants } from '#/components/ui/button'
import { cn } from '#/lib/utils'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes standard caching default
    },
  },
})
export const Route = createRootRoute<{ queryClient: QueryClient }>({
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
  return (
    <html lang="en" suppressHydrationWarning>
      <QueryClientProvider client={queryClient}>
        <head>
          <HeadContent />
        </head>
        <body>
          <ThemeProvider>
            {children}
            <Toaster closeButton position="top-center" />
          </ThemeProvider>
          <Scripts />
        </body>
      </QueryClientProvider>
    </html>
  )
}
