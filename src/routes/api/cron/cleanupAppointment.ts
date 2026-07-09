import { prisma } from '#/db'
import { AppointmentStatus } from '#/generated/prisma/enums'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/cron/cleanupAppointment')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        // 1. Grab the bearer token from the automated incoming request
        const authHeader = request.headers.get('Authorization')

        if (authHeader !== `Bearer ${process.env.CRON_SECRET_TOKEN}`) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized access' }),
            {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            },
          )
        }

        try {
          // 2. Perform your database operations
          const missed = await prisma.appointment.updateMany({
            where: {
              status: AppointmentStatus.Upcoming,
              date: { lt: new Date() }, // Matches any appointment time that has passed
            },
            data: { status: AppointmentStatus.NoShow },
          })

          return Response.json({ success: true, updatedCount: missed.count })
        } catch (error: any) {
          return Response.json(
            { success: false, error: error.message },
            { status: 500 },
          )
        }
      },
    },
  },
})
