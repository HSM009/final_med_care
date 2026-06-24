import { Roles } from '#/generated/prisma/enums'

export function hasPermission(userRole: Roles, requiredRole: Roles): boolean {
  const hierarchy = {
    [Roles.Patient]: 0,
    [Roles.Doctor]: 1,
    [Roles.Admin]: 2,
  }

  return hierarchy[userRole] >= hierarchy[requiredRole]
}
