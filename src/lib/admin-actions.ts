import { createServerFn } from '@tanstack/react-start'
import { prisma } from '@/db'
import { authFnMiddleware } from '@/middlewares/auth'
import {
  adminActionSchema,
  forceChangeEmailSchemaExtended,
  adminSearchSchema,
} from '@/schemas/auth'
import { emailChangeNotification } from '@/components/email'

const PAGE_SIZE = 8
export const getPatientsFn = createServerFn({ method: 'GET' })
  .validator(adminSearchSchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data }) => {
    const searchString = data?.search?.trim()
    const currentPage = data?.page || 1
    const whereClause = {
      NOT: [
        {
          id: data.userId,
        },
      ],
      ...(searchString
        ? {
            AND: [
              {
                OR: [
                  {
                    name: {
                      contains: searchString,
                      mode: 'insensitive' as const,
                    },
                  },
                ],
              },
            ],
          }
        : {}),
    }
    const [items, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        skip: (currentPage - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        orderBy: { id: 'asc' },
      }),
      prisma.user.count({ where: whereClause }),
    ])
    return { items, totalCount }
  })

export const autoBanMaliciousUserFn = createServerFn({ method: 'POST' })
  .validator((data: { email: string; reason: string }) => data)
  .handler(async ({ data }) => {
    const centuryFromNow = new Date(new Date().getFullYear() + 100, 0, 1)
    await prisma.$transaction([
      prisma.user.update({
        where: { email: data.email },
        data: {
          banned: true,
          banReason: data.reason,
          banExpires: centuryFromNow,
        },
      }),
      prisma.session.deleteMany({
        where: { user: { email: data.email } },
      }),
    ])
    return { success: true }
  })

export const adminForceEmailChangeWithExpiryFn = createServerFn({
  method: 'POST',
})
  .validator(forceChangeEmailSchemaExtended)
  .handler(async ({ data }) => {
    await prisma.user.update({
      where: { id: data.userId },
      data: {
        email: data.newEmail,
        emailVerified: true,
      },
    })
    emailChangeNotification(data.userName, data.newEmail, data.currentEmail)
    return { success: true }
  })

export const adminActions = createServerFn({
  method: 'POST',
})
  .validator(adminActionSchema)
  .handler(async ({ data }) => {
    const { fId, Title, newValue } = data
    await prisma.user.update({
      where: { id: fId },
      data: {
        [Title]: newValue,
      },
    })
  })
