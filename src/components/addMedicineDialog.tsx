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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { prisma } from '@/db'
import { authFnMiddleware } from '@/middlewares/auth'
import { addOrUpdateMedicineSchema } from '@/schemas/auth'
import { useForm } from '@tanstack/react-form'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

interface MedicineDialogProps {
  children: React.ReactNode
}

const addMedicineAction = createServerFn({ method: 'POST' })
  .inputValidator(addOrUpdateMedicineSchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data }) => {
    return await prisma.$transaction(async (tx) => {
      const newMedicine = await tx.medicineList.create({
        data: {
          medicineContentEnglish: data.medicineContentEnglish,
          medicineContentUrdu: data.medicineContentUrdu,
          Dosage: data.Dosage,
        },
      })
      return newMedicine
    })
  })

export function MedicineDialog({ children }: MedicineDialogProps) {
  const navigate = useNavigate()
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const form = useForm({
    defaultValues: {
      medicineContentEnglish: '',
      medicineContentUrdu: '',
      Dosage: '',
    },
    validators: {
      onSubmit: addOrUpdateMedicineSchema,
      onChange: addOrUpdateMedicineSchema,
    },
    onSubmit: async ({ value }) => {
      startTransition(async () => {
        try {
          // Call the server function instead of Prisma directly
          await addMedicineAction({ data: value })

          toast.success('Medicine added successfully.')
          setIsOpen(false)
          // form.reset()
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
            <DialogTitle>Add Medicine</DialogTitle>
            <DialogDescription>
              Enter the prescription details below.
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
                      Medicine Name in English
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
                      Medicine Name in Urdu
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
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
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
                {isPending ? 'Creating Medicine ID...' : 'Add Medicine'}
              </span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
