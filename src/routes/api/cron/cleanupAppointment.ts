import { prisma } from '#/db'
import {
  AppointmentStatus,
  // CronStatus,
  // CronType,
} from '#/generated/prisma/enums'
// import { cronTypeDescriptions } from '#/lib/types'
// import { CronJobsLog } from '#/server/actions'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/cron/cleanupAppointment')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const authHeader = request.headers.get('Authorization')
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
          return new Response('Unauthorized', { status: 401 })
        }

        try {
          const nowDate = new Date()
          const missedAppointments = await prisma.appointment.findMany({
            where: {
              status: AppointmentStatus.Upcoming,
              date: nowDate,
            },
            include: {
              patient: {
                select: {
                  name: true,
                  email: true,
                  medCareId: true,
                },
              },
              doctor: {
                select: {
                  name: true,
                },
              },
            },
          })
          if (!missedAppointments) {
            console.log('success : true, updatedCount: 0, emailSent: 0')
            return Response.json({
              success: true,
              updatedCount: 0,
              emailSent: 0,
            })
          }
          const missedIds = missedAppointments.map((NoShow) => NoShow.id)
          await prisma.appointment.updateMany({
            where: {
              id: { in: missedIds },
            },
            data: { status: AppointmentStatus.NoShow },
          })

          // const emailBatch = missedAppointments.filter

          // await CronJobsLog({
          //   data: {
          //     cronType: CronType.Email_sent_NoShow,
          //     cronStatus: CronStatus.Success,
          //     cronStatusText: cronTypeDescriptions[CronType.Email_sent_NoShow], //map text
          //     updatedCount: missedAppointments.length,
          //   },
          // })
          console.log(
            '✅ CRON JOB CLEAN UP APPOINTMENT SUCCESS : Updated Count:',
            missedIds.length,
            '.',
          )
          return Response.json({
            success: true,
            updatedCount: missedIds.length,
          })
        } catch (error: any) {
          // await CronJobsLog({
          //   data: {
          //     cronType: CronType.Email_sent_NoShow,
          //     cronStatus: CronStatus.Failed,
          //     cronStatusText: cronTypeDescriptions[CronType.Email_sent_NoShow], //map text
          //     updatedCount: 0,
          //   },
          // })
          console.error('❌ CRON JOB DATABASE FAILURE:', error)
          return Response.json(
            { success: false, error: error.message },
            { status: 500 },
          )
        }
      },
    },
  },
})
