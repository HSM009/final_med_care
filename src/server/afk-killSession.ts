import type { Roles } from '#/generated/prisma/enums'
import { authClient } from '#/lib/auth-client'
import { toast } from 'sonner'

export async function handleAfkSignOut(type: Roles, navigate: any) {
  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        toast.success('Session expired due to inactivity.')
        navigate({
          to: '/login',
          search: {
            type: type,
            reason: 'Afk sign out',
          },
        })
      },
    },
  })
}
