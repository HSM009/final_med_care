import { prisma } from '#/db'
import {
  AppointmentStatus,
  CronStatus,
  CronType,
} from '#/generated/prisma/enums'
import { cronTypeDescriptions } from '#/lib/types'
import { CronJobsLog } from '#/server/actions'
import { createFileRoute } from '@tanstack/react-router'

// 1. Force Vercel to bypass build caching and process live code on every hit
export const dynamic = 'force-dynamic'

export const Route = createFileRoute('/api/cron/cleanupAppointment')({
  server: {
    handlers: {
      // 2. Must be GET because Vercel Cron infra exclusively calls GET
      GET: async ({ request }) => {
        const authHeader = request.headers.get('Authorization')
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
          return new Response('Unauthorized', { status: 401 })
        }

        try {
          const nowDate = new Date()

          // 3. Fix exact time mismatch: target all appointments older/equal to "now"
          const missedAppointments = await prisma.appointment.findMany({
            where: {
              status: AppointmentStatus.Upcoming,
              date: {
                lte: nowDate,
              },
            },
            include: {
              patient: {
                select: {
                  name: true,
                  email: true,
                  medCareId: true,
                },
                doctor: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          })

          if (!missedAppointments || missedAppointments.length === 0) {
            console.log('✅ CRON JOB RUN: success : true, updatedCount: 0')
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

          await CronJobsLog({
            data: {
              cronType: CronType.Email_sent_NoShow,
              cronStatus: CronStatus.Success,
              cronStatusText: cronTypeDescriptions[CronType.Email_sent_NoShow],
              updatedCount: missedAppointments.length,
            },
          })

          console.log(
            '✅ CRON JOB CLEAN UP APPOINTMENT SUCCESS : Updated Count:',
            missedIds.length,
          )

          return Response.json({
            success: true,
            updatedCount: missedIds.length,
          })
        } catch (error: any) {
          await CronJobsLog({
            data: {
              cronType: CronType.Email_sent_NoShow,
              cronStatus: CronStatus.Failed,
              cronStatusText: cronTypeDescriptions[CronType.Email_sent_NoShow],
              updatedCount: 0,
            },
          })
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
