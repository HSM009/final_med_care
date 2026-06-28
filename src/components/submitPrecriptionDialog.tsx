import { useState, useTransition } from 'react'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog'
import { toast } from 'sonner'
import { useRouter } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'

import {
  uploadPrescriptionAttachmentAction,
  type UploadedFileInfo,
} from '#/lib/vercel-action'
import {
  addPrescriptionSubmission,
  updatePrescriptionSubmission,
} from '#/server/actions'

interface SubmitPrescriptionDialogProps {
  prescriptionId: string
  prescriptionType: string
  medCareId: string
  doctorId: string
  note: string
  prescriptionVal: boolean
  medicinesList: any[]
  existingUploadedImages: UploadedFileInfo[] // 🌐 Track already uploaded assets
  onSuccess?: (
    submitted: boolean,
    typeSubmitted: string,
    finalizedImages: UploadedFileInfo[],
  ) => void
  attachments: File[]
}

export function SubmitPrescriptionDialog({
  prescriptionId,
  prescriptionType,
  medCareId,
  doctorId,
  note,
  medicinesList,
  onSuccess,
  prescriptionVal,
  existingUploadedImages,
  attachments,
}: SubmitPrescriptionDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const queryClient = useQueryClient()
  const router = useRouter()

  const executeCloudUploads = async (
    toastId: string | number,
  ): Promise<UploadedFileInfo[]> => {
    if (attachments.length === 0) return []
    const trackingArray: UploadedFileInfo[] = []

    for (let i = 0; i < attachments.length; i++) {
      const fileToUpload = attachments[i]

      toast.loading(
        `Uploading asset (${i + 1}/${attachments.length}): ${fileToUpload.name}...`,
        { id: toastId },
      )

      const formData = new FormData()
      formData.append('file', fileToUpload)

      const result = await uploadPrescriptionAttachmentAction({
        data: formData,
      })

      if (!result.success || !result.fileInfo) {
        throw new Error(
          result.error || `Upload failed on item: ${fileToUpload.name}`,
        )
      }
      trackingArray.push(result.fileInfo)
    }
    return trackingArray
  }

  const submitPrescriptionHandler = async () => {
    const toastId = toast.loading('Initializing validation protocols...')

    startTransition(async () => {
      try {
        let newCloudAssets: UploadedFileInfo[] = []
        if (attachments.length > 0) {
          toast.loading(
            `Preparing transmission for ${attachments.length} files...`,
            { id: toastId },
          )
          newCloudAssets = await executeCloudUploads(toastId)
        }

        const finalImagesPayload = [
          ...existingUploadedImages,
          ...newCloudAssets,
        ]

        const cleanedMedicinesList = medicinesList.map(
          ({ id, activeStatus, createdPrescription, ...rest }) => rest,
        )
        const databasePayload = {
          prescriptionId,
          medCareId,
          doctorId,
          note,
          prescriptionsContent: JSON.stringify(cleanedMedicinesList),
          prescriptionSubmitted: prescriptionVal,
          relatedImages: JSON.stringify(finalImagesPayload),
        }
        if (databasePayload.prescriptionId === '1') {
          await addPrescriptionSubmission({ data: databasePayload })
        } else {
          await updatePrescriptionSubmission({ data: databasePayload })
        }

        toast.success(
          prescriptionVal
            ? 'Prescription submitted successfully.'
            : 'Prescription saved successfully.',
          { id: toastId },
        )

        setIsOpen(false)
        onSuccess?.(true, prescriptionType, finalImagesPayload)
        await queryClient.invalidateQueries({
          queryKey: ['prescriptions', databasePayload.medCareId],
        })
        await router.invalidate()
      } catch (error: any) {
        toast.error(
          error.message || 'Something went wrong finalizing the prescription.',
          { id: toastId },
        )
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
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-200'
          }`}
        >
          {prescriptionType}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Confirmation Alert</DialogTitle>
          <DialogDescription>
            {prescriptionVal
              ? 'Are you sure you want to submit this prescription? This action cannot be undone.'
              : 'Your prescription will be saved. You can submit it later when you are ready.'}
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
            onClick={submitPrescriptionHandler}
            className={`cursor-pointer min-w-30 ${
              prescriptionVal
                ? 'bg-green-600 hover:bg-green-700 text-white'
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
      </DialogContent>
    </Dialog>
  )
}
