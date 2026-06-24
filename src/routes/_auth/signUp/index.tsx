import { Roles } from '#/generated/prisma/enums'
import { signInType } from '#/schemas/auth'
import { SignupForm } from '@/components/signup-form'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/signUp/')({
  validateSearch: (search) => {
    return signInType.parse(search)
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { type } = Route.useSearch()
  return (
    <div
      className={` w-full ${type === Roles.Patient ? ' bg-blue-500/50' : ' bg-red-500/50 '} `}
    >
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <SignupForm type={type} />
        </div>
      </div>
    </div>
  )
}
