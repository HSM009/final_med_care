import { SignupForm } from '@/components/signup-form'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/signUp/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="w-full max-w-sm">
      <SignupForm />
    </div>
  )
}
