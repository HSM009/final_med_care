import { LoginType } from '#/lib/types'
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

  return (
    <div
      className={` w-full ${type === LoginType.Patient ? ' bg-blue-500/50' : ' bg-red-500/50 '} `}
    >
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          {reason && (
            <div className=" font-bold text-red-500 text-xs italic border-2 border-transparent bg-red-500/5 p-4 rounded-xl mb-2">
              You were inactive too long. So your current session has expired.
            </div>
          )}
          <LoginForm type={type} />
        </div>
      </div>
    </div>
  )
}
