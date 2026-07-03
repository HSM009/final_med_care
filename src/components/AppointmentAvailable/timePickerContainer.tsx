import { useState, useCallback, memo } from 'react'
import { TimePickerContent } from './timePickerContent'

interface TimePickerContainerProps {
  onAddSlot: (startTime: string, endTime: string) => void
}

export const TimePickerContainer = memo(
  ({ onAddSlot }: TimePickerContainerProps) => {
    // Localized state isolated completely from the parent dashboard grid
    const [startH, setStartH] = useState<string>('09')
    const [startM, setStartM] = useState<string>('00')
    const [duration, setDuration] = useState<number>(30)

    // Pure mathematical helper isolated within the container
    const calculateEndTime = useCallback(
      (sh: string, sm: string, durMin: number): string => {
        const totalStartMinutes = parseInt(sh, 10) * 60 + parseInt(sm, 10)
        const totalEndMinutes = (totalStartMinutes + durMin) % 1440
        const endH = Math.floor(totalEndMinutes / 60)
          .toString()
          .padStart(2, '0')
        const endM = (totalEndMinutes % 60).toString().padStart(2, '0')
        return `${endH}:${endM}`
      },
      [],
    )

    const handleAdd = useCallback(() => {
      const startTime = `${startH}:${startM}`
      const endTime = calculateEndTime(startH, startM, duration)

      onAddSlot(startTime, endTime)
    }, [startH, startM, duration, calculateEndTime, onAddSlot])

    return (
      <TimePickerContent
        startH={startH}
        startM={startM}
        duration={duration}
        setStartH={setStartH}
        setStartM={setStartM}
        setDuration={setDuration}
        calculateEndTime={calculateEndTime}
        onAdd={handleAdd}
      />
    )
  },
)

TimePickerContainer.displayName = 'TimePickerContainer'
