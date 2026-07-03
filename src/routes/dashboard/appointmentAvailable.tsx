import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Calendar,
  Clock,
  Plus,
  X,
  Save,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import { DayOfWeek, Roles } from '#/generated/prisma/enums'

import { Button } from '@/components/ui/button'
import { Popover, PopoverTrigger } from '@/components/ui/popover'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card'
import {
  getAppointmentDashboardData,
  upsertDoctorSlots,
} from '#/server/actions'
import {
  getInitialScheduleState,
  type DoctorAppointment,
  type SearchParams,
  type TimeSlotItem,
} from '#/lib/types'
import { showToast } from '#/lib/showToast'
import { GetDoctorAppointmentDialog } from '#/components/AppointmentAvailable/getDoctorAppointment'
import { TimePickerContainer } from '#/components/AppointmentAvailable/timePickerContainer'

type WeeklyScheduleState = Record<DayOfWeek, TimeSlotItem[]>
const DAYS_ARRAY = Object.values(DayOfWeek) as DayOfWeek[]

export const Route = createFileRoute('/dashboard/appointmentAvailable')({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    doctorId: typeof search.doctorId === 'string' ? search.doctorId : undefined,
    doctorName:
      typeof search.doctorName === 'string' ? search.doctorName : undefined,
    doctorQualification:
      typeof search.doctorQualification === 'string'
        ? search.doctorQualification
        : undefined,
  }),

  loaderDeps: ({ search: { doctorId, doctorName, doctorQualification } }) => ({
    doctorId,
    doctorName,
    doctorQualification,
  }),

  loader: async ({
    context,
    deps: { doctorId, doctorName, doctorQualification },
  }) => {
    const defaultState = getInitialScheduleState()
    const userRole = context.auth.user?.role as Roles
    const targetDoctorId =
      userRole === Roles.Admin ? doctorId : context.auth.user?.id

    if (!targetDoctorId) {
      return {
        initialSchedule: defaultState,
        activeDoctorId: null,
        activeDoctorName: null,
        activeDoctorQualification: null,
      }
    }

    const missingNameParam = !doctorName && userRole === Roles.Admin

    const dataPayload = await getAppointmentDashboardData({
      data: {
        doctorId: targetDoctorId,
        shouldFetchName: missingNameParam,
        shouldFetchQualification: missingNameParam,
      },
    })

    return {
      initialSchedule: dataPayload.initialSchedule,
      activeDoctorId: targetDoctorId,
      activeDoctorName: doctorName || null,
      activeDoctorQualification: doctorQualification || null,
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { auth } = Route.useRouteContext()
  const {
    initialSchedule,
    activeDoctorId,
    activeDoctorName,
    activeDoctorQualification,
  } = Route.useLoaderData()

  const queryClient = useQueryClient()
  const navigate = useNavigate({ from: Route.fullPath })

  const [schedule, setSchedule] = useState<WeeklyScheduleState>(initialSchedule)
  const [showSuccess, setShowSuccess] = useState(false)
  const [activeDay, setActiveDay] = useState<DayOfWeek | null>(null)

  useEffect(() => {
    setSchedule(initialSchedule)
  }, [initialSchedule])

  const slotsMeta = useMemo(() => {
    const meta: Record<string, Set<string>> = {}
    Object.entries(schedule).forEach(([day, slots]) => {
      meta[day] = new Set((slots || []).map((s) => s.startTime))
    })
    return meta
  }, [schedule])

  const parseTimeToMinutes = (timeStr: string): number => {
    const [h, m] = timeStr.split(':').map(Number)
    return h * 60 + m
  }

  const calculateEndTime = (sh: string, sm: string, durMin: number): string => {
    const totalStartMinutes = parseInt(sh, 10) * 60 + parseInt(sm, 10)
    const totalEndMinutes = (totalStartMinutes + durMin) % 1440
    return `${Math.floor(totalEndMinutes / 60)
      .toString()
      .padStart(2, '0')}:${(totalEndMinutes % 60).toString().padStart(2, '0')}`
  }

  const addTimeSlot = useCallback(
    (day: DayOfWeek, startTime: string, endTime: string) => {
      if (slotsMeta[day]?.has(startTime)) {
        showToast.info('Time slot already selected.')
        return
      }

      setSchedule((prev) => ({
        ...prev,
        [day]: [...(prev[day] || []), { startTime, endTime }].sort((a, b) =>
          a.startTime.localeCompare(b.startTime),
        ),
      }))
      setActiveDay(null)
    },
    [slotsMeta],
  )
  const appendConsecutiveSlot = (day: DayOfWeek, slot: TimeSlotItem) => {
    const startMins = parseTimeToMinutes(slot.startTime)
    let durMin = parseTimeToMinutes(slot.endTime) - startMins
    if (durMin <= 0) durMin += 1440

    const nextStartTime = slot.endTime
    const nextEndTime = calculateEndTime(
      nextStartTime.split(':')[0],
      nextStartTime.split(':')[1],
      durMin,
    )

    setSchedule((prev) => ({
      ...prev,
      [day]: [
        ...(prev[day] || []),
        { startTime: nextStartTime, endTime: nextEndTime },
      ].sort((a, b) => a.startTime.localeCompare(b.startTime)),
    }))
  }

  const removeTimeSlot = (day: DayOfWeek, targetIndex: number) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: (prev[day] || []).filter((_, idx) => idx !== targetIndex),
    }))
  }

  const clearDaySlots = (day: DayOfWeek) => {
    setSchedule((prev) => ({ ...prev, [day]: [] }))
  }

  const syncScheduleMutation = useMutation({
    mutationFn: async (updatedSchedule: WeeklyScheduleState) => {
      showToast.loading('Updating the doctor schedule.', { id: 'sched-flow' })
      const flatPayload = Object.entries(updatedSchedule).flatMap(
        ([day, slots]) =>
          (slots || []).map((s) => ({
            day: day as DayOfWeek,
            startTimeMinutes: parseTimeToMinutes(s.startTime),
            endTimeMinutes: parseTimeToMinutes(s.endTime),
          })),
      )
      return await upsertDoctorSlots({
        data: {
          slots: flatPayload,
          doctorId: activeDoctorId || String(auth.user?.id),
        },
      })
    },
    onSuccess: () => {
      showToast.success('Doctor schedule updated.', { id: 'sched-flow' })
      queryClient.invalidateQueries({ queryKey: ['doctorSlots'] })
      setShowSuccess(true)
    },
  })

  const handleSelectDoctor = (doctor: DoctorAppointment) => {
    navigate({
      search: (old) => ({
        ...old,
        doctorId: doctor.id,
        doctorName: doctor.name,
        doctorQualification: doctor.qualification,
      }),
    })
  }

  return (
    <div className="w-full">
      <div className="text-3xl font-bold text-white mb-10 text-center">
        Appointment Scheduling
      </div>

      {auth.user?.role === Roles.Admin && (
        <div className="mb-6 flex items-center justify-between bg-zinc-900/40 p-4 rounded-xl border border-zinc-800">
          <div className="flex items-center gap-3">
            {/* Label: Maintained at text-sm */}
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Selected Profile:
            </span>
            <span className="inline-flex items-center gap-2 px-3.5 py-1 text-base font-bold text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-400/10 border border-emerald-500/20 dark:border-emerald-400/20 rounded-full backdrop-blur-sm shadow-sm shadow-emerald-500/5 tracking-wide">
              {/* Status Indicator Dot - adjusted slightly to match text-base scale */}
              <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              {activeDoctorName || 'None Selected'} (
              {activeDoctorQualification || 'Category'})
            </span>
          </div>
          <GetDoctorAppointmentDialog onSelectDoctor={handleSelectDoctor}>
            <Button className="font-medium cursor-pointer" size="sm">
              Find Doctor Appointment
            </Button>
          </GetDoctorAppointmentDialog>
        </div>
      )}

      {showSuccess && (
        <div className="p-3 mb-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium rounded-lg flex items-center gap-2 border border-emerald-500/20">
          <CheckCircle2 className="size-4 text-emerald-500" /> Your schedule
          updated. Please allow a moment to allow changes in the system.
        </div>
      )}

      <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs bg-white dark:bg-zinc-950">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-900 pb-6">
          <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
            Please set up the schedule.
          </CardDescription>
          <Button
            onClick={() => syncScheduleMutation.mutate(schedule)}
            disabled={syncScheduleMutation.isPending}
            className="text-xs h-9 font-semibold shrink-0 cursor-pointer"
          >
            {syncScheduleMutation.isPending ? (
              <Loader2 className="size-3.5 animate-spin mr-2" />
            ) : (
              <Save className="size-3.5 mr-2" />
            )}
            {syncScheduleMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardHeader>

        <CardContent className="p-0 divide-y divide-zinc-100 dark:divide-zinc-900">
          {DAYS_ARRAY.map((day) => {
            const slots = schedule[day] || []
            const dayTimes = slotsMeta[day]

            return (
              <div
                key={day}
                className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center gap-4 transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20"
              >
                <div className="w-36 shrink-0 flex items-center gap-2.5">
                  <Calendar className="size-4 text-zinc-400 dark:text-zinc-500" />
                  <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    {day}
                  </span>
                </div>

                <div className="flex-1 flex flex-wrap gap-x-4 gap-y-3 items-center">
                  {slots.length > 0 ? (
                    slots.map((slot, idx) => {
                      const nextSlotExists = dayTimes?.has(slot.endTime)
                      return (
                        <div key={idx} className="flex items-center gap-1">
                          <div className="inline-flex items-center gap-2 pl-2.5 pr-1.5 py-1 rounded-md border border-emerald-500/30 dark:border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-500/10 text-xs font-semibold text-emerald-700 dark:text-emerald-400 shadow-2xs">
                            <Clock className="size-3 text-emerald-500/70 dark:text-emerald-400/70" />
                            <span className="tabular-nums">
                              {slot.startTime} - {slot.endTime}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeTimeSlot(day, idx)}
                              className="p-0.5 rounded-xs hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 cursor-pointer"
                            >
                              <X className="size-3" />
                            </button>
                          </div>
                          {!nextSlotExists ? (
                            <button
                              type="button"
                              onClick={() => appendConsecutiveSlot(day, slot)}
                              title="Chain next slot segment automatically"
                              className="p-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/40 hover:bg-emerald-500/5 text-zinc-500 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 transition-all cursor-pointer shadow-2xs"
                            >
                              <Plus className="size-3 stroke-[2.5px]" />
                            </button>
                          ) : (
                            <div className="w-6.5 h-6.5" />
                          )}
                        </div>
                      )
                    })
                  ) : (
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 italic font-normal py-1">
                      No operational slots assigned
                    </span>
                  )}
                </div>

                <div className="w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-0 border-zinc-100 dark:border-zinc-900 flex flex-col md:items-end gap-2">
                  <Popover
                    open={activeDay === day}
                    onOpenChange={(open) => setActiveDay(open ? day : null)}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-9 px-3 text-xs font-medium w-full md:w-24 cursor-pointer"
                      >
                        Add Slot
                      </Button>
                    </PopoverTrigger>

                    {activeDay === day && (
                      <TimePickerContainer
                        onAddSlot={(startTime, endTime) =>
                          addTimeSlot(day, startTime, endTime)
                        }
                      />
                    )}
                  </Popover>
                  {slots.length > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => clearDaySlots(day)}
                      className="h-9 px-3 text-xs font-semibold cursor-pointer w-full md:w-24 shadow-2xs"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
