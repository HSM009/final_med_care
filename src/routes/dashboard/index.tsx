import { getSessionFn } from '#/data/session'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/')({
  beforeLoad: async () => {
    const data = await getSessionFn()
    if (!data || !data.user) {
      throw redirect({ to: '/login' })
    }
    return { userName: data.user.name }
  },
  component: App,
})

function App() {
  const { userName } = Route.useRouteContext()
  const initCName = userName
    ? userName.charAt(0).toUpperCase() + userName.slice(1).toLowerCase()
    : ''

  return (
    <div className="flex flex-col gap-4 h-full w-full items-center justify-center text-center">
      <p className="text-6xl font-bold">
        Welcome to the Dashboard, {initCName}!
      </p>
      <br />
      <p className=" text-3xl">Have a Nice Day</p>
    </div>
  )
}
