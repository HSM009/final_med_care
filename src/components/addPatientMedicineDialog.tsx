import { Button } from './ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { useEffect, useState, useTransition } from 'react'
import { Input } from './ui/input'
import { searchPatientMedicineAction } from '#/server/actions'

export interface MedicineItem {
  id: number
  medicineContentEnglish: string
  medicineContentUrdu: string
  Dosage: string
}

interface MedicineDialogProps {
  children: React.ReactNode
  onSelectMedicine: (medicine: MedicineItem) => void
}

export function MedicineDialog({
  children,
  onSelectMedicine,
}: MedicineDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<MedicineItem[]>([])
  const [isPending, startTransition] = useTransition()

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    if (!value.trim()) {
      setResults([])
    }
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
          const data = await searchPatientMedicineAction({
            data: { search: trimmedQuery },
          })
          setResults(data as MedicineItem[])
        } catch (error) {
          console.error('Search failed:', error)
        }
      })
    }, 300)
    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  const handleSelect = (medicine: MedicineItem) => {
    onSelectMedicine(medicine)
    setIsOpen(false) // Close modal instantly upon selection
    setSearchQuery('') // Clear query state for next invocation
    setResults([])
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md bg-neutral-900 border-neutral-800 text-white">
        <DialogHeader>
          <DialogTitle>Add Medicine</DialogTitle>
          <DialogDescription className="text-neutral-400">
            Search and select a medicine to add to the prescription.
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 space-y-3">
          <Input
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Type medicine name (e.g., Panadol)..."
            className="w-full bg-neutral-800 border-neutral-700 text-white"
            autoComplete="off"
          />

          <div className="max-h-48 overflow-y-auto border border-neutral-800 rounded-lg divide-y divide-neutral-800 bg-neutral-950">
            {isPending && results.length === 0 ? (
              <div className="p-3 text-sm text-neutral-400 text-center">
                Searching...
              </div>
            ) : results.length > 0 ? (
              results.map((medicine) => (
                <button
                  key={medicine.id}
                  type="button"
                  onClick={() => handleSelect(medicine)}
                  className="w-full text-left p-3 text-sm hover:bg-neutral-800/60 transition-colors block cursor-pointer text-neutral-200"
                >
                  {medicine.medicineContentEnglish} {medicine.Dosage}
                </button>
              ))
            ) : searchQuery.trim().length > 3 ? (
              <div className="p-3 text-sm text-neutral-500 text-centerv italic">
                No medicines found
              </div>
            ) : (
              <div className="p-3 text-sm text-neutral-500 text-center italic">
                Type 3 characters to search.
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
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
