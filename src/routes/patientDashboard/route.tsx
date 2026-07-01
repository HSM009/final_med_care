import { PatientNavbar } from '#/components/PatientDashboard/navbar'
import { buttonVariants } from '#/components/ui/button'
import { Roles } from '#/generated/prisma/enums'

import { cn } from '#/lib/utils'
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useRouter,
} from '@tanstack/react-router'
// import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'

export const Route = createFileRoute('/patientDashboard')({
  component: RouteComponent,
  beforeLoad: async ({ location, context }) => {
    const user = context.auth.user
    if (!user) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
          reason: 'expired',
          type: Roles.Patient,
        },
      })
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
          to="/patientDashboard"
        >
          Go Dashboard Home Page
        </Link>
      </div>
    )
  },
  pendingComponent: () => null,
})

function RouteComponent() {
  const router = useRouter()

  useEffect(() => {
    const ONE_HOUR_MS = 60 * 60 * 1000
    const interval = setInterval(() => {
      router.invalidate()
    }, ONE_HOUR_MS)
    return () => clearInterval(interval)
  }, [router])
  const { auth } = Route.useRouteContext()
  const authName = auth.user?.name
  return (
    <div className=" text-zinc-900 dark:text-zinc-50 transition-colors duration-200">
      <PatientNavbar name={authName!} />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4 sticky top-2 z-50 ">
        <div className="flex flex-1 flex-col bg-background py-4 px-2 sm:px-4 lg:px-6 dark:bg-background rounded-2xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
