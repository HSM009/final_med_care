import { prisma } from '#/db'
import {
  AppointmentStatus,
  CronStatus,
  CronType,
} from '#/generated/prisma/enums'
import { cronTypeDescriptions } from '#/lib/types'
import { CronJobsLog } from '#/server/actions'

export const config = {
  runtime: 'edge', // Using Edge ensures lightning fast, zero-cold-start execution
}

export default async function handler(request: Request) {
  // Ensure it's a GET request
  if (request.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const authHeader = request.headers.get('Authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const nowDate = new Date()
    const missedAppointments = await prisma.appointment.findMany({
      where: {
        status: AppointmentStatus.Upcoming,
        date: {
          lte: nowDate,
        },
      },
    })

    if (!missedAppointments || missedAppointments.length === 0) {
      return new Response(JSON.stringify({ success: true, updatedCount: 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const missedIds = missedAppointments.map((NoShow) => NoShow.id)
    await prisma.appointment.updateMany({
      where: { id: { in: missedIds } },
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

    return new Response(
      JSON.stringify({ success: true, updatedCount: missedIds.length }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  } catch (error: any) {
    console.error('❌ CRON JOB FAILURE:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
}
