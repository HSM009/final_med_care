import { AppSidebar } from '#/components/app-sidebar'
import { buttonVariants } from '#/components/ui/button'
import { Separator } from '#/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '#/components/ui/sidebar'
import { getSessionFn } from '#/data/session'
import { LoginType } from '#/lib/types'
import { cn } from '#/lib/utils'
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useRouter,
} from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'

export const Route = createFileRoute('/dashboard')({
  component: RouteComponent,
  beforeLoad: async ({ location }) => {
    const session = await getSessionFn()
    if (!session || !session.user) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href, reason: 'expired' },
      })
    }
    const recievedRole = session.user?.role?.toLowerCase().trim()
    const userRole = LoginType.Patient.toLowerCase()
    if (recievedRole === userRole) {
      throw redirect({
        to: '/patientDashboard',
      })
    }

    return { session }
  },
  loader: ({ context }) => {
    return {
      user: context.session.user,
    }
  },
  notFoundComponent: () => {
    return (
      <div>
        <div className=" p-4 text-amber-700 ">
          <p>Page Not found :| </p> <p>Most probably under Development.</p>
          <p>Comeback Soon</p>
        </div>
        <Link
          className={cn(
            ' block ml-4 mt-4 ',
            buttonVariants({ variant: 'secondary' }),
          )}
          to="/dashboard"
        >
          Go Dashboard Home Page
        </Link>
      </div>
    )
  },
  pendingComponent: () => (
    <div className="flex h-[50vh] flex-col items-center justify-center gap-2 text-zinc-400">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      <p className="text-sm">Loading your Page...</p>
    </div>
  ),
  pendingMs: 1000,
})

function RouteComponent() {
  const { session } = Route.useRouteContext()
  const router = useRouter()
  useEffect(() => {
    const interval = setInterval(async () => {
      await router.invalidate()
    }, 60_000)
    return () => clearInterval(interval)
  }, [router])

  return (
    <div>
      <SidebarProvider>
        <AppSidebar user={session.user} role={session.user.role!} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1 animate-bounce-x" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
            </div>
          </header>
          <div className=" flex flex-1 flex-col gap-4 p-4 pt-4">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
