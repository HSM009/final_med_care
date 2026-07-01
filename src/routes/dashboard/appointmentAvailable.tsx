import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
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
import { DayOfWeek } from '#/generated/prisma/enums'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card'
import { getDoctorSlots, upsertDoctorSlots } from '#/server/actions'
import type { TimeSlotItem } from '#/lib/types'
import { showToast } from '#/lib/showToast'

type WeeklyScheduleState = Record<DayOfWeek, TimeSlotItem[]>

const DAYS_ARRAY = Object.values(DayOfWeek) as DayOfWeek[]

const DURATIONS = [15, 30, 45, 60]

const getInitialScheduleState = (): WeeklyScheduleState => {
  return Object.fromEntries(
    DAYS_ARRAY.map((day) => [day, []]),
  ) as unknown as WeeklyScheduleState
}

export const Route = createFileRoute('/dashboard/appointmentAvailable')({
  loader: async ({ context }) => {
    const defaultState = getInitialScheduleState()
    const doctorId = context.auth.user?.id

    if (!doctorId) return { initialSchedule: defaultState }

    try {
      const response = await getDoctorSlots({ data: { doctorId } })
      const dbSlots = response?.items || []

      const loadedState = getInitialScheduleState()
      dbSlots.forEach((slot) => {
        const dayKey = slot.day as DayOfWeek
        if (loadedState[dayKey]) {
          loadedState[dayKey].push({
            startTime: slot.startTime,
            endTime: slot.endTime,
          })
        }
      })

      Object.keys(loadedState).forEach((key) => {
        const dayKey = key as DayOfWeek
        loadedState[dayKey].sort((a, b) =>
          a.startTime.localeCompare(b.startTime),
        )
      })

      return { initialSchedule: loadedState }
    } catch (error) {
      console.error('Failed loading provider active windows:', error)
      return { initialSchedule: defaultState }
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { initialSchedule } = Route.useLoaderData()
  const queryClient = useQueryClient()

  const [schedule, setSchedule] = useState<WeeklyScheduleState>(initialSchedule)
  const [showSuccess, setShowSuccess] = useState(false)
  const [activeDay, setActiveDay] = useState<DayOfWeek | null>(null)

  const [startH, setStartH] = useState<string>('09')
  const [startM, setStartM] = useState<string>('00')
  const [duration, setDuration] = useState<number>(30)

  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, '0'),
  )
  const minutes = Array.from({ length: 12 }, (_, i) =>
    (i * 5).toString().padStart(2, '0'),
  )

  const hoursScrollRef = useRef<HTMLDivElement>(null)
  const minutesScrollRef = useRef<HTMLDivElement>(null)
  const durationScrollRef = useRef<HTMLDivElement>(null)

  const scrollToSelected = (
    containerRef: React.RefObject<HTMLDivElement | null>,
    selector: string,
  ) => {
    if (!containerRef.current) return
    const activeItem = containerRef.current.querySelector(
      selector,
    ) as HTMLElement
    if (activeItem) {
      activeItem.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
  }

  useEffect(() => {
    if (activeDay) {
      setTimeout(() => {
        scrollToSelected(hoursScrollRef, `[data-hour="${startH}"]`)
        scrollToSelected(minutesScrollRef, `[data-min="${startM}"]`)
        scrollToSelected(durationScrollRef, `[data-dur="${duration}"]`)
      }, 60)
    }
  }, [activeDay, startH, startM, duration])

  const parseTimeToMinutes = (timeStr: string): number => {
    const [h, m] = timeStr.split(':').map(Number)
    return h * 60 + m
  }

  const calculateEndTime = (sh: string, sm: string, durMin: number): string => {
    const totalStartMinutes = parseInt(sh, 10) * 60 + parseInt(sm, 10)
    const totalEndMinutes = (totalStartMinutes + durMin) % 1440

    const eh = Math.floor(totalEndMinutes / 60)
      .toString()
      .padStart(2, '0')
    const em = (totalEndMinutes % 60).toString().padStart(2, '0')
    return `${eh}:${em}`
  }

  const addTimeSlot = (day: DayOfWeek) => {
    const startTime = `${startH}:${startM}`
    const endTime = calculateEndTime(startH, startM, duration)

    const daySlots = schedule[day] || []

    // Pure validation handled outside setSchedule to avoid React strict mode duplicate logs
    if (daySlots.some((s) => s.startTime === startTime)) {
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
  }

  const appendConsecutiveSlot = (day: DayOfWeek, slot: TimeSlotItem) => {
    const startMins = parseTimeToMinutes(slot.startTime)
    const endMins = parseTimeToMinutes(slot.endTime)

    let durMin = endMins - startMins
    if (durMin <= 0) durMin += 1440

    const nextStartTime = slot.endTime
    const nextEndTime = calculateEndTime(
      nextStartTime.split(':')[0],
      nextStartTime.split(':')[1],
      durMin,
    )

    setSchedule((prev) => {
      const daySlots = prev[day] || []
      //   if (daySlots.some((s) => s.startTime === nextStartTime)) return prev
      return {
        ...prev,
        [day]: [
          ...daySlots,
          { startTime: nextStartTime, endTime: nextEndTime },
        ].sort((a, b) => a.startTime.localeCompare(b.startTime)),
      }
    })
  }

  const removeTimeSlot = (day: DayOfWeek, targetIndex: number) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: (prev[day] || []).filter((_, idx) => idx !== targetIndex),
    }))
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
      return await upsertDoctorSlots({ data: { slots: flatPayload } })
    },
    onSuccess: () => {
      showToast.success('Doctor schedule updated.', { id: 'sched-flow' })
      queryClient.invalidateQueries({ queryKey: ['doctorSlots'] })
      setShowSuccess(true)
    },
  })
  const clearDaySlots = (day: DayOfWeek) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: [], // Simply resets this specific day's array back to empty
    }))
  }
  return (
    <div className="w-full">
      <div className="text-3xl font-bold text-white mb-10 text-center">
        Account Settings
      </div>
      {showSuccess && (
        <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium rounded-lg flex items-center gap-2 border border-emerald-500/20">
          <CheckCircle2 className="size-4 text-emerald-500" /> Your schedule
          updated. Please allow a moments to allow changes in the system.
        </div>
      )}

      <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs bg-white dark:bg-zinc-950">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-900 pb-6">
          <div className="space-y-1">
            <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
              Please set up your schedule.
            </CardDescription>
          </div>

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
                      // Hides the consecutive button if a chain slot already exists
                      const nextSlotExists = slots.some(
                        (s) => s.startTime === slot.endTime,
                      )

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
                              className="p-0.5 rounded-xs hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200 transition-colors cursor-pointer"
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
                            <div className="w-6.5 h-6.5" /> // Stabilizer layout placeholder
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
                  {/* The Add Slot Popover (Fixed Width to Match Clear Button) */}
                  <Popover
                    open={activeDay === day}
                    onOpenChange={(open) => setActiveDay(open ? day : null)}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-9 px-3 text-xs font-medium border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-zinc-700 dark:text-zinc-300 flex items-center justify-center gap-2 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 w-full md:w-24"
                      >
                        <Plus className="size-3.5 text-zinc-400" />
                        Add Slot
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-72 p-0" align="end">
                      {/* ... keeping the interior hour/minute/duration selections exactly identical ... */}
                      <div className="grid grid-cols-3 divide-x divide-zinc-100 dark:divide-zinc-800 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 py-1.5">
                        <div>Hour</div>
                        <div>Minute</div>
                        <div>Duration</div>
                      </div>

                      <div className="flex h-44 divide-x divide-zinc-100 dark:divide-zinc-800">
                        <ScrollArea
                          ref={hoursScrollRef}
                          className="w-full h-full p-1 scroll-smooth"
                        >
                          {hours.map((h) => (
                            <button
                              key={h}
                              data-hour={h}
                              onClick={() => setStartH(h)}
                              className={`text-xs w-full py-1.5 rounded-md mb-0.5 cursor-pointer font-medium transition-colors ${startH === h ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'}`}
                            >
                              {h}
                            </button>
                          ))}
                        </ScrollArea>

                        <ScrollArea
                          ref={minutesScrollRef}
                          className="w-full h-full p-1 scroll-smooth"
                        >
                          {minutes.map((m) => (
                            <button
                              key={m}
                              data-min={m}
                              onClick={() => setStartM(m)}
                              className={`text-xs w-full py-1.5 rounded-md mb-0.5 cursor-pointer font-medium transition-colors ${startM === m ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'}`}
                            >
                              {m}
                            </button>
                          ))}
                        </ScrollArea>

                        <ScrollArea
                          ref={durationScrollRef}
                          className="w-full h-full p-1 scroll-smooth"
                        >
                          {DURATIONS.map((dur) => (
                            <button
                              key={dur}
                              data-dur={dur}
                              onClick={() => setDuration(dur)}
                              className={`text-xs w-full py-1.5 rounded-md mb-0.5 cursor-pointer font-medium transition-colors ${duration === dur ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'}`}
                            >
                              {dur} m
                            </button>
                          ))}
                        </ScrollArea>
                      </div>

                      <div className="p-2 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between gap-2">
                        <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 pl-1">
                          Range:{' '}
                          <span className="font-bold text-zinc-800 dark:text-zinc-100">
                            {startH}:{startM} -{' '}
                            {calculateEndTime(startH, startM, duration)}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          className="text-xs font-semibold h-7 px-3"
                          onClick={() => addTimeSlot(day)}
                        >
                          Add
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* ✅ Destructive Variant, matching clean h-9 sizing and identical width parameters */}
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
