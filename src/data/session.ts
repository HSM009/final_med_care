import { auth } from '@/lib/auth'
import { createServerFn } from '@tanstack/react-start'
import {
  getRequestHeaders,
  setResponseHeader,
} from '@tanstack/react-start/server'

export const getSessionFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const headers = getRequestHeaders()

    const session = await auth.api.getSession({ headers })

    const token = 'your_gen11erated_jwt_token'
    const cookieValue = `session_token=${token}; HttpOnly; Secure; SameSite=Lax; Path=/`
    setResponseHeader('Set-Cookie', cookieValue)

    if (!session) {
      return { user: null }
    }

    return session
  },
)
