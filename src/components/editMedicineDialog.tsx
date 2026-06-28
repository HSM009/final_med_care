import { type EditMedicineDialogNavProps } from '#/lib/types'
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
import { Input } from '#/components/ui/input'
import { addOrUpdateMedicineSchema } from '#/schemas/auth'
import { useForm } from '@tanstack/react-form'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { useState, type ReactNode } from 'react'
import { Field, FieldError, FieldGroup, FieldLabel } from './ui/field'
import { updateMedicineAction } from '#/server/actions'
import { showToast } from '#/lib/showToast'

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
      try {
        // Fixed: Passing primary row identification field along with payload tracking data object
        await updateMedicineAction({ data: { ...value, id: Id } })

        showToast.success('Medicine updated successfully.')
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
        showToast.error('Something went wrong saving the medicine.')
      }
    },
  })

  return (
    <div className="inline-block w-full ">
      {/* Fixed: Added wrapper div to prevent dialog portal from breaking layout */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <form
            noValidate
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
                        disabled={form.state.isSubmitting}
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
                        disabled={form.state.isSubmitting}
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
                        disabled={form.state.isSubmitting}
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
                disabled={form.state.isSubmitting}
                type="submit"
              >
                <span className="absolute inset-0 flex items-center justify-center">
                  {form.state.isSubmitting ? 'Updating...' : 'Update Medicine'}
                </span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
