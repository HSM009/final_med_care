import { adminNotification, emailTemplate } from '@/components/email'
import { prisma } from '@/db'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { APIError, createAuthMiddleware } from 'better-auth/api'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { admin } from 'better-auth/plugins'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: false,
  },
  experimental: { joins: true },

  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await emailTemplate(user.email, url)
      try {
        await adminNotification(user.name, user.email)
      } catch (error) {
        console.error(
          'Failed to notify admin regarding registration instance:',
          error,
        )
      }
    },
  }, // 💡 Fixed the missing closing brace here

  user: {
    changeEmail: {
      enabled: true,
    },
    additionalFields: {
      cellNo: { type: 'string', required: false, input: true },
      qualification: { type: 'string', required: false, input: true },
      banned: { type: 'boolean', required: false, input: false },
      bannedReason: { type: 'string', required: false, input: false },
      role: {
        type: 'string',
        required: true,
        input: false,
      },
      // 💡 Added to support temporary credential windows
      // tempPasswordExpires: { type: 'date', required: false, input: false },
    },
  },

  plugins: [
    {
      id: 'rate-limiting-lockout',
      hooks: {
        // 🛡️ 1. BEFORE HOOK: Stop banned/expired credentials before checking passwords
        before: [
          {
            matcher: (context) => !!context.path?.includes('/sign-in/email'),
            handler: createAuthMiddleware(async (ctx) => {
              const body = ctx.body as Record<string, any> | undefined
              const email = body?.email

              if (!email) return

              // Look up user status and password expiration info
              const user = await prisma.user.findUnique({
                where: { email },
                select: {
                  banned: true,
                  banExpires: true,
                  banReason: true,
                  // tempPasswordExpires: true,
                },
              })

              // 🛡️ Check A: Temporary Admin Assigned Password Expiration Window
              // if (
              //   user?.tempPasswordExpires &&
              //   user.tempPasswordExpires < new Date()
              // ) {
              //   throw new APIError('UNAUTHORIZED', {
              //     message:
              //       'TEMP_PASSWORD_EXPIRED: The temporary credentials assigned by the administrator have expired.',
              //   })
              // }

              // 🛡️ Check B: Admin ban if the current ban window is still active
              if (
                user &&
                user.banned &&
                user.banReason === 'Registration request rejected by admin.' &&
                user.banExpires &&
                user.banExpires > new Date()
              ) {
                throw new APIError('UNAUTHORIZED', {
                  message: `ADMIN_REJECT_REGISTRATION: User is banned by admin`,
                })
              }

              // 🛡️ Check C: Login attempt failure if the current ban window is still active
              if (
                user &&
                user.banned &&
                user.banExpires &&
                user.banExpires > new Date()
              ) {
                const expiryTime = user.banExpires.getTime()
                const remainingMs = expiryTime - Date.now()
                const remainingMinutes = Math.ceil(remainingMs / (60 * 1000))
                console.log(
                  `User ${email} is locked out. Remaining time: ${remainingMinutes} minutes.`,
                )
                throw new APIError('UNAUTHORIZED', {
                  message: `LOCKOUT_EXPIRY:${expiryTime}: ${remainingMinutes}`,
                })
              }

              // 🛡️ Check D: Login attempt failure if ban is yes and banExpires is null.
              if (user && user.banned && user.banExpires == null) {
                throw new APIError('UNAUTHORIZED', {
                  message: `ADMIN_BANNED: User is banned by admin`,
                })
              }
            }),
          },
        ],

        // 🔄 2. AFTER HOOK: Process pass/fail tallies
        after: [
          {
            matcher: (context) => !!context.path?.includes('/sign-in/email'),
            handler: createAuthMiddleware(async (ctx) => {
              const body = ctx.body as Record<string, any> | undefined
              const email = body?.email

              if (!email) return

              const newSession = ctx.context.newSession

              // 🟢 PATH A: SUCCESS
              if (newSession) {
                await prisma.user.update({
                  where: { email },
                  data: {
                    failedAttempts: 0,
                    banned: false,
                    banExpires: null,
                    banReason: null,
                    // Clear the temporary window on successful sign-in so it doesn't cause issues later
                    // tempPasswordExpires: null,
                  },
                })
                return
              }

              // 🔴 PATH B: FAILURE (Wrong password / Auth failed)
              const user = await prisma.user.findUnique({
                where: { email },
                select: { failedAttempts: true },
              })

              if (!user) return

              const nextAttempts = user.failedAttempts + 1
              const maxAttempts = 5
              const isLockoutTriggered = nextAttempts >= maxAttempts

              console.log(
                `❌ Failed login attempt detected for ${email}. Incrementing counter. ${nextAttempts}/${maxAttempts}`,
              )

              await prisma.user.update({
                where: { email },
                data: {
                  failedAttempts: nextAttempts,
                  banned: isLockoutTriggered,
                  banExpires: isLockoutTriggered
                    ? new Date(Date.now() + 15 * 60 * 1000)
                    : null, // Lockout for 15 mins
                  banReason: isLockoutTriggered
                    ? 'Too many failed login attempts'
                    : null,
                },
              })
            }),
          },
        ],
      },
    },
    {
      id: 'signup-protection-guard',
      hooks: {
        before: [
          {
            matcher: (context) => !!context.path?.includes('/sign-up/email'),
            handler: createAuthMiddleware(async (ctx) => {
              const body = ctx.body as Record<string, any> | undefined
              const email = body?.email

              if (!email) return

              const existingUser = await prisma.user.findUnique({
                where: { email: email.toLowerCase().trim() },
              })

              if (existingUser) {
                throw new APIError('BAD_REQUEST', {
                  message: 'USER_ALREADY_EXISTS',
                })
              }
            }),
          },
        ],
      },
    },
    admin(),
    tanstackStartCookies(),
  ],
})
