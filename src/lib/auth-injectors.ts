import { Roles } from '#/generated/prisma/enums'
import type { AuthContextResult } from './types'

/**
 * Normalizes a Better-Auth session into a standardized application context object.
 * @param session The session object returned from getSessionFn()
 */
export function createAuthContext(session: any): AuthContextResult {
  return {
    auth: {
      user: session?.user
        ? {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            qualification: session.user.qualification,
            cellNo: session.user.cellNo,
            gender: session.user.gender,
            dateOfBirth: session.user.dateOfBirth,
            role: (session.user.role || Roles.Patient) as Roles,
          }
        : null,
    },
  }
}
