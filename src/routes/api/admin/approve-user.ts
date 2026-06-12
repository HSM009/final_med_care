import { createFileRoute } from '@tanstack/react-router'
import { prisma } from '@/db'
import { autoBanMaliciousUserFn } from '#/lib/admin-actions'
import { verifyAdminSignature } from '#/lib/crypto'

export const Route = createFileRoute('/api/admin/approve-user')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        // 1. Native Web API parsing - eliminates the 'vinxi/http' missing module issue
        const url = new URL(request.url)
        const email = url.searchParams.get('email')
        const action = url.searchParams.get('action')
        const sig = url.searchParams.get('sig')

        if (!email || !action || !sig) {
          return new Response('Bad Request: Missing parameters.', {
            status: 400,
          })
        }

        // 2. CRITICAL CHECK: Verify that the signature matches the parameters
        const isValidRequest = verifyAdminSignature(email, sig)
        if (!isValidRequest) {
          return new Response(
            'Unauthorized: Invalid cryptographic signature.',
            {
              status: 401,
            },
          )
        }

        try {
          const user = await prisma.user.findUnique({ where: { email } })
          if (!user) {
            return new Response('Record not found.', { status: 404 })
          }

          if (action === 'approve') {
            await prisma.user.update({
              where: { email },
              data: {
                emailVerified: true,
                banned: false,
                banReason: null,
                bannedReason: null,
                banExpires: null,
              },
            })

            return new Response(
              `<html>
                <body style="font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f9fafb;">
                  <div style="text-align: center; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <h2 style="color: #22c55e; margin-bottom: 0.5rem;">Approved!</h2>
                    <p style="color: #4b5563;">Account for <strong>${email}</strong> is now live.</p>
                    <p style="color: #6b7280; font-size: 0.875rem; margin-top: 1rem;">You can now close this tab.</p>
                  </div>
                </body>
              </html>`,
              { headers: { 'Content-Type': 'text/html' } },
            )
          }

          if (action === 'deny') {
            await autoBanMaliciousUserFn({
              data: {
                email: email,
                reason: 'Registration request rejected by admin',
              },
            })
            return new Response(
              `<html>
                <body style="font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f9fafb;">
                  <div style="text-align: center; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <h2 style="color: #ef4444; margin-bottom: 0.5rem;">Rejected</h2>
                    <p style="color: #4b5563;">Account for <strong>${email}</strong> has been locked.</p>
                  </div>
                </body>
              </html>`,
              { headers: { 'Content-Type': 'text/html' } },
            )
          }

          return new Response('Invalid route context action.', { status: 400 })
        } catch (error) {
          console.error('Database write error execution failure:', error)
          return new Response('Internal Server Error.', { status: 500 })
        }
      },
    },
  },
})
