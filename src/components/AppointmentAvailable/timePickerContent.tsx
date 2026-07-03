import { useEffect, useRef, memo } from 'react'
import { PopoverContent } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'

interface TimePickerContentProps {
  startH: string
  startM: string
  duration: number
  setStartH: (h: string) => void
  setStartM: (m: string) => void
  setDuration: (d: number) => void
  onAdd: () => void
  calculateEndTime: (h: string, m: string, d: number) => string
}

// Memory Optimization: Static definitions declared outside rendering pipeline loops
const DURATIONS = [15, 30, 45, 60]
const HOURS = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, '0'),
)
const MINUTES = Array.from({ length: 12 }, (_, i) =>
  (i * 5).toString().padStart(2, '0'),
)

export const TimePickerContent = memo(
  ({
    startH,
    startM,
    duration,
    setStartH,
    setStartM,
    setDuration,
    onAdd,
    calculateEndTime,
  }: TimePickerContentProps) => {
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
      const delayDebounceFn = setTimeout(() => {
        scrollToSelected(hoursScrollRef, `[data-hour="${startH}"]`)
        scrollToSelected(minutesScrollRef, `[data-min="${startM}"]`)
        scrollToSelected(durationScrollRef, `[data-dur="${duration}"]`)
      }, 40)
      return () => clearTimeout(delayDebounceFn)
    }, [startH, startM, duration])

    return (
      <PopoverContent
        className="w-72 p-0 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-md rounded-lg"
        align="end"
      >
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
            {HOURS.map((h) => (
              <button
                key={h}
                data-hour={h}
                type="button"
                onClick={() => setStartH(h)}
                className={`text-xs w-full py-1.5 rounded-md mb-0.5 font-medium cursor-pointer transition-colors ${
                  startH === h
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                {h}
              </button>
            ))}
          </ScrollArea>

          <ScrollArea
            ref={minutesScrollRef}
            className="w-full h-full p-1 scroll-smooth"
          >
            {MINUTES.map((m) => (
              <button
                key={m}
                data-min={m}
                type="button"
                onClick={() => setStartM(m)}
                className={`text-xs w-full py-1.5 rounded-md mb-0.5 font-medium cursor-pointer transition-colors ${
                  startM === m
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}
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
                type="button"
                onClick={() => setDuration(dur)}
                className={`text-xs w-full py-1.5 rounded-md mb-0.5 font-medium cursor-pointer transition-colors ${
                  duration === dur
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                {dur} m
              </button>
            ))}
          </ScrollArea>
        </div>

        <div className="p-2 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between gap-2">
          <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 pl-1">
            Range:{' '}
            <span className="font-bold text-zinc-800 dark:text-zinc-100 tabular-nums">
              {startH}:{startM} - {calculateEndTime(startH, startM, duration)}
            </span>
          </div>
          <Button
            size="sm"
            className="text-xs font-semibold h-7 px-3 cursor-pointer"
            onClick={onAdd}
          >
            Add
          </Button>
        </div>
      </PopoverContent>
    )
  },
)

TimePickerContent.displayName = 'TimePickerContent'
