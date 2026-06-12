import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { createServerFn } from '@tanstack/react-start'
import { authFnMiddleware } from '@/middlewares/auth'
import { prisma } from '@/db'
import { toast } from 'sonner'
import { useRouter } from '@tanstack/react-router'

export const addPrescriptionSubmission = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .handler(async ({ data }: { data: any }) => {
    return await prisma.$transaction(async (tx) => {
      const newPrescription = await tx.patientPrescription.create({
        data: {
          med_care_id: data.med_care_id,
          prescriptionsContent: data.prescriptionsContent,
          prescriptionSubmitted: data.prescriptionSubmitted,
          doctorId: data.doctorId,
          note: data.note,
        },
      })
      return newPrescription
    })
  })

interface SubmitPrescriptionDialogProps {
  prescriptionType: string
  med_care_id: string
  doctorId: string
  note: string
  prescriptionVal: Boolean
  medicinesList: any[]
  onSuccess?: (submitted: boolean, typeSubmitted: string) => void
}

export function SubmitPrescriptionDialog({
  prescriptionType,
  med_care_id,
  doctorId,
  note,
  medicinesList,
  onSuccess,
  prescriptionVal,
}: SubmitPrescriptionDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const submitPrescriptionHandler = async (values: any) => {
    startTransition(async () => {
      try {
        await addPrescriptionSubmission({ data: values })
        toast.success(
          ` ${values.prescriptionSubmitted ? 'Prescription submitted successfully.' : 'Prescription saved successfully.'}.`,
        )
        setIsOpen(false)
        onSuccess?.(true, prescriptionType)
        await router.invalidate()
      } catch (error) {
        toast.error('Something went wrong finalizing the prescription.')
        console.error(error)
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className={`w-40 font-medium cursor-pointer transition-colors ${
            prescriptionVal
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-200'
          }`}
        >
          {prescriptionType}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
        >
          <DialogHeader>
            <DialogTitle>Confirmation Alert</DialogTitle>
            <DialogDescription>
              {prescriptionVal
                ? 'Are you sure you want to submit this prescription? This action cannot be undone.'
                : 'Your precription will be saved. You can submit it later when you are ready.'}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-6 flex flex-row justify-end gap-2">
            <DialogClose asChild>
              <Button
                type="button"
                disabled={isPending}
                className="cursor-pointer hover:bg-destructive/60 bg-destructive text-white"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              disabled={isPending}
              onClick={() => {
                const cleanedMedicinesList = medicinesList.map(
                  ({ id, activeStatus, createdPrescription, ...rest }) => rest,
                )

                submitPrescriptionHandler({
                  med_care_id: med_care_id,
                  doctorId: doctorId,
                  note: note,
                  prescriptionsContent: JSON.stringify(cleanedMedicinesList),
                  prescriptionSubmitted: prescriptionVal,
                })
              }}
              className={` cursor-pointer min-w-30 ${
                prescriptionVal
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-200'
              }`}
            >
              {prescriptionVal
                ? isPending
                  ? 'Submitting...'
                  : 'Submit Prescription'
                : isPending
                  ? 'Saving...'
                  : 'Save Prescription'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
