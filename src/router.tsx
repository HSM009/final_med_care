import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { queryClient } from '#/lib/query-client'
import type { MyRouterContext } from './routes/__root'

export function getRouter(initialAuth: MyRouterContext['auth']) {
  const router = createTanStackRouter({
    routeTree,
    context: {
      queryClient,
      auth: initialAuth,
    },
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
