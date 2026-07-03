import { useEffect, useState, useTransition, useMemo } from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { getDoctor } from '#/lib/admin-actions'
import type { DoctorAppointment } from '#/lib/types'

interface DoctorAppointmentProps {
  children: React.ReactNode
  onSelectDoctor: (doctor: DoctorAppointment) => void
}

export function GetDoctorAppointmentDialog({
  children,
  onSelectDoctor,
}: DoctorAppointmentProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<DoctorAppointment[]>([])
  const [isPending, startTransition] = useTransition()

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    if (!value.trim()) setResults([])
  }

  useEffect(() => {
    const trimmedQuery = searchQuery.trim()
    if (trimmedQuery.length < 3) {
      setResults([])
      return
    }

    const delayDebounceFn = setTimeout(() => {
      startTransition(async () => {
        try {
          const response = await getDoctor({ data: { search: trimmedQuery } })
          setResults(
            response?.items
              ? (response.items as unknown as DoctorAppointment[])
              : [],
          )
        } catch (error) {
          console.error('Doctor search network invocation failed:', error)
          setResults([])
        }
      })
    }, 250) // Reduced to 250ms debounce window for snappier UI interaction feedback

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  const handleSelect = (doctor: DoctorAppointment) => {
    onSelectDoctor(doctor)
    setIsOpen(false)
    setSearchQuery('')
    setResults([])
  }

  // Pre-compiled list mapping to prevent rendering engine bottlenecks
  const renderListContents = useMemo(() => {
    if (isPending && results.length === 0) {
      return (
        <div className="p-4 text-sm text-neutral-400 text-center animate-pulse">
          Searching profiles...
        </div>
      )
    }
    if (results.length > 0) {
      return results.map((doctor) => (
        <button
          key={doctor.id}
          type="button"
          onClick={() => handleSelect(doctor)}
          className="w-full text-left p-3 text-sm hover:bg-neutral-800/60 transition-colors block cursor-pointer text-neutral-200 focus:bg-neutral-800/60 focus:outline-hidden"
        >
          <div className="font-semibold text-white">{doctor.name}</div>
          {doctor.qualification && (
            <div className="text-xs text-neutral-400 mt-0.5">
              {doctor.qualification}
            </div>
          )}
        </button>
      ))
    }
    if (searchQuery.trim().length >= 3) {
      return (
        <div className="p-4 text-sm text-neutral-500 text-center italic">
          No matching doctors located
        </div>
      )
    }
    return (
      <div className="p-4 text-sm text-neutral-500 text-center italic">
        Type 3 characters to search.
      </div>
    )
  }, [results, isPending, searchQuery])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md bg-neutral-900 border-neutral-800 text-white shadow-xl content-start">
        <DialogHeader>
          <DialogTitle>Find Doctor</DialogTitle>
          <DialogDescription className="text-neutral-400">
            Search by name to configure operational schedules.
          </DialogDescription>
        </DialogHeader>

        <div className="my-2 space-y-3">
          <Input
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Type doctor name..."
            className="w-full bg-neutral-800 border-neutral-700 text-white focus-visible:ring-1 focus-visible:ring-emerald-500"
            autoComplete="off"
          />
          <div className="max-h-52 overflow-y-auto border border-neutral-800 rounded-lg divide-y divide-neutral-800 bg-neutral-950 contain-intrinsic-size-[208px]">
            {renderListContents}
          </div>
        </div>

        <DialogFooter className="mt-2">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer border-neutral-700 text-neutral-300 hover:bg-neutral-800"
            >
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
