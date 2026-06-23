import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/patientDashboard/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/loginDashboard/"!</div>
}
