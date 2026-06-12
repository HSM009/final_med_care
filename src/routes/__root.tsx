import {
  HeadContent,
  Link,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
// import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
// import { TanStackDevtools } from '@tanstack/react-devtools'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/lib/theme-provider'

import appCss from '../styles.css?url'
import { buttonVariants } from '#/components/ui/button'
import { cn } from '#/lib/utils'

export const Route = createRootRoute({
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
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider>
          {children}
          <Toaster closeButton position="top-center" />
        </ThemeProvider>
        {/* <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          // plugins={[
          //   {
          //     name: 'Tanstack Router',
          //     render: <TanStackRouterDevtoolsPanel />,
          //   },
          // ]}
        /> */}
        <Scripts />
      </body>
    </html>
  )
}
