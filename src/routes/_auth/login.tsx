import { Roles } from '#/generated/prisma/enums'
import { loginErrorRedirect } from '#/schemas/auth'
import { LoginForm } from '@/components/login-form'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/login')({
  validateSearch: (search) => {
    return loginErrorRedirect.parse(search)
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { reason, type } = Route.useSearch()
  const { auth } = Route.useRouteContext()
  const user = auth.user
  return (
    <div
      className={` w-full ${type === Roles.Patient ? ' bg-blue-500/50' : ' bg-red-500/50 '} `}
    >
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          {!user ? (
            <>
              {reason && (
                <div className=" font-bold text-red-900 text-xs italic  bg-red-500/60 p-4 rounded-xl mb-2">
                  You were inactive too long. So your current session has
                  expired. ({reason})
                </div>
              )}
              <LoginForm type={type} />
            </>
          ) : (
            <>
              <span>You are logged.</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
