import { EditMedicineDialogNavProps } from '@/lib/types'
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
import { Input } from '@/components/ui/input'
import { addOrUpdateMedicineSchema, updateMedicineSchema } from '@/schemas/auth'
import { useForm } from '@tanstack/react-form'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { useState, useTransition, ReactNode } from 'react'
import { Field, FieldError, FieldGroup, FieldLabel } from './ui/field'
import { createServerFn } from '@tanstack/react-start'
import { authFnMiddleware } from '@/middlewares/auth'
import { prisma } from '@/db'
import { toast } from 'sonner'

const updateMedicineAction = createServerFn({ method: 'POST' })
  .inputValidator(updateMedicineSchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data }) => {
    return await prisma.$transaction(async (tx) => {
      const newMedicine = await tx.medicineList.update({
        where: { id: data.id }, // Fixed: id pulled safely from validator
        data: {
          medicineContentEnglish: data.medicineContentEnglish,
          medicineContentUrdu: data.medicineContentUrdu,
          Dosage: data.Dosage,
        },
      })
      return newMedicine
    })
  })

interface ExtendedEditProps extends EditMedicineDialogNavProps {
  children: ReactNode
}

export function EditMedicineDialog({
  Id,
  medicineContentEnglish,
  medicineContentUrdu,
  Dosage,
  children,
}: ExtendedEditProps) {
  const navigate = useNavigate()
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const form = useForm({
    // Fixed: Standardize initial value tracking layout directly against live model props
    defaultValues: {
      medicineContentEnglish: medicineContentEnglish || '',
      medicineContentUrdu: medicineContentUrdu || '',
      Dosage: Dosage || '',
    },
    validators: {
      onSubmit: addOrUpdateMedicineSchema,
      onChange: addOrUpdateMedicineSchema,
    },
    onSubmit: async ({ value }) => {
      startTransition(async () => {
        try {
          // Fixed: Passing primary row identification field along with payload tracking data object
          await updateMedicineAction({ data: { ...value, id: Id } })

          toast.success('Medicine updated successfully.')
          setIsOpen(false)

          navigate({
            to: '/dashboard/viewMedicineList',
            search: {
              search: value.medicineContentEnglish.trim(),
            },
          })

          setTimeout(() => {
            form.reset()
          }, 100)

          await router.invalidate()
        } catch (error) {
          toast.error('Something went wrong saving the medicine.')
        }
      })
    },
  })

  return (
    <div className="inline-block w-full ">
      {/* Fixed: Added wrapper div to prevent dialog portal from breaking layout */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
          >
            <DialogHeader>
              <DialogTitle>Edit Medicine</DialogTitle>
              <DialogDescription>
                Modify the prescription details below.
              </DialogDescription>
            </DialogHeader>

            <FieldGroup className="py-4">
              <form.Field
                name="medicineContentEnglish"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Medicine Name English
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Enter name in English"
                        autoComplete="off"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              />
            </FieldGroup>

            <FieldGroup className="py-4">
              <form.Field
                name="medicineContentUrdu"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Medicine Name Urdu
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Enter name in Urdu"
                        autoComplete="off"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              />
            </FieldGroup>

            <FieldGroup className="py-4">
              <form.Field
                name="Dosage"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Dosage</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Enter dosage"
                        autoComplete="off"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              />
            </FieldGroup>

            <DialogFooter className=" flex items-center">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className=" cursor-pointer"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                className="cursor-pointer bg-green-800 hover:bg-green-700 text-white px-20 relative"
                disabled={isPending}
                type="submit"
              >
                <span className="absolute inset-0 flex items-center justify-center">
                  {isPending ? 'Updating...' : 'Update Medicine'}
                </span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
