import { useState, useEffect } from 'react' // ✅ Added useEffect
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'

export function isValidDate(date: Date | undefined) {
  if (!date) return false
  const parsedDate = date instanceof Date ? date : new Date(date)
  return !isNaN(parsedDate.getTime())
}

export function calculateAge(birthDate: Date | undefined): number | null {
  if (!isValidDate(birthDate)) return null
  const cleanBirthDate =
    birthDate instanceof Date ? birthDate : new Date(birthDate!)
  const today = new Date()
  let age = today.getFullYear() - cleanBirthDate.getFullYear()
  const monthDifference = today.getMonth() - cleanBirthDate.getMonth()
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < cleanBirthDate.getDate())
  ) {
    age--
  }
  return age >= 0 ? age : null
}

function formatDate(date: Date | null | undefined) {
  if (!date) return ''
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

interface DatePickerProps {
  currentDate?: Date | string | null
  onDateChange: (date: Date | undefined) => void
}

export function DateOfBirthPicker({
  currentDate,
  onDateChange,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)

  const [date, setDate] = useState<Date | undefined>(undefined)
  const [month, setMonth] = useState<Date | undefined>(undefined)
  const [value, setValue] = useState('')

  useEffect(() => {
    if (currentDate) {
      const parsed =
        currentDate instanceof Date ? currentDate : new Date(currentDate)
      if (isValidDate(parsed)) {
        setDate(parsed)
        setMonth(parsed)
        setValue(formatDate(parsed))
        return
      }
    }
    // Fallback defaults if currentDate is empty or invalid
    const fallbackDate = new Date()
    setDate(fallbackDate)
    setMonth(fallbackDate)
    setValue(formatDate(fallbackDate))
  }, [currentDate])

  const age = calculateAge(date)

  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <div className="flex items-stretch">
        <div className="relative flex-1">
          <Input
            id="date"
            value={value}
            placeholder="January 01, 2025"
            className="bg-background pr-10 rounded-r-none focus-visible:relative focus-visible:z-10"
            onChange={(e) => {
              const parsedInputDate = new Date(e.target.value)
              setValue(e.target.value)

              if (isValidDate(parsedInputDate)) {
                setDate(parsedInputDate)
                setMonth(parsedInputDate)
                onDateChange?.(parsedInputDate)
              } else {
                setDate(undefined)
                onDateChange?.(undefined)
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setOpen(true)
              }
            }}
          />
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                id="date-picker"
                variant="ghost"
                className="absolute top-1/2 right-2 size-6 -translate-y-1/2 active:-translate-y-1/2 p-0 z-20"
              >
                <CalendarIcon className="size-3.5" />
                <span className="sr-only">Pick a date</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="end"
              alignOffset={-8}
              sideOffset={10}
            >
              <Calendar
                mode="single"
                // ✅ Calendar should read local state synced with parent props
                selected={date}
                month={month}
                onMonthChange={setMonth}
                onSelect={(selectedDate) => {
                  setDate(selectedDate)
                  setValue(formatDate(selectedDate))
                  setOpen(false)
                  onDateChange?.(selectedDate)
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        {age !== null && (
          <div className="dark:text-black text-white flex items-center justify-center px-3 dark:bg-white bg-black border border-input border-l-0 rounded-r-md text-sm font-medium whitespace-nowrap select-none">
            {age} {age === 1 ? 'year old' : 'years old'}
          </div>
        )}
      </div>
    </div>
  )
}
