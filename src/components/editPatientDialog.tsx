import { EditPatientDialogNavProps } from '@/lib/types'
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
import { addPatientSchema, updatePatientSchema } from '@/schemas/auth'
import { useForm } from '@tanstack/react-form'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { useState, useTransition, ReactNode } from 'react'
import { Field, FieldError, FieldGroup, FieldLabel } from './ui/field'
import { createServerFn } from '@tanstack/react-start'
import { authFnMiddleware } from '@/middlewares/auth'
import { prisma } from '@/db'
import { toast } from 'sonner'
import { DateOfBirthPicker } from './datePicker'
import { Gender } from '@/generated/prisma/enums'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

const updatePatientAction = createServerFn({ method: 'POST' })
  .inputValidator(updatePatientSchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data }) => {
    return await prisma.$transaction(async (tx) => {
      const newPatient = await tx.patientRecord.update({
        where: { id: data.id },
        data: {
          name: data.name,
          email: data.email,
          age: data.age,
          phone: data.phone,
          gender: data.gender,
        },
      })
      return newPatient
    })
  })

interface ExtendedEditProps extends EditPatientDialogNavProps {
  children: ReactNode
}

export function EditPatientDialog({
  Id,
  name,
  email,
  age,
  phone,
  gender,
  children,
}: ExtendedEditProps) {
  const navigate = useNavigate()
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const form = useForm({
    // Fixed: Standardize initial value tracking layout directly against live model props
    defaultValues: {
      name: name || '',
      email: email || '',
      age: age || new Date(),
      phone: phone || '',
      gender: gender as Gender,
    },
    validators: {
      onSubmit: addPatientSchema,
      onChange: addPatientSchema,
    },
    onSubmit: async ({ value }) => {
      startTransition(async () => {
        try {
          // Fixed: Passing primary row identification field along with payload tracking data object
          await updatePatientAction({ data: { ...value, id: Id } })
          toast.success('Patient updated successfully.')
          setIsOpen(false)

          navigate({
            to: '/dashboard/viewPatients',
            search: {
              search: value.name.trim(),
            },
          })

          setTimeout(() => {
            form.reset()
          }, 100)

          await router.invalidate()
        } catch (error) {
          toast.error('Something went wrong saving the patient.')
        }
      })
    },
  })

  return (
    <div className="inline-block  ">
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
              <DialogTitle>Edit Patient</DialogTitle>
              <DialogDescription>
                Modify the patient details below.
              </DialogDescription>
            </DialogHeader>

            <FieldGroup className="py-4">
              <form.Field
                name="name"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name} className=" text-xs">
                        Patient Name
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Enter name"
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
                name="phone"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name} className=" text-xs">
                        Phone
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Enter phone number"
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
                name="email"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name} className=" text-xs">
                        Patient Email
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Enter patient email"
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

            <FieldGroup>
              <form.Field
                name="gender"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name} className=" text-xs">
                        Gender
                      </FieldLabel>
                      <Select
                        name={field.name}
                        value={field.state.value}
                        defaultValue={field.state.value}
                        onValueChange={(value) =>
                          field.handleChange(
                            value as 'MALE' | 'FEMALE' | 'OTHER',
                          )
                        }
                      >
                        <SelectTrigger
                          id={field.name}
                          onBlur={field.handleBlur}
                          aria-invalid={isInvalid}
                          className="w-full cursor-pointer"
                        >
                          <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>

                        <SelectContent position="popper">
                          <SelectItem value="MALE">Male</SelectItem>
                          <SelectItem value="FEMALE">Female</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>

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
                name="age"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name} className=" text-xs">
                        Date of Birth
                      </FieldLabel>
                      <DateOfBirthPicker
                        currentDate={field.state.value}
                        onDateChange={(date) => {
                          field.handleChange(date ?? new Date())
                        }}
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
                  {isPending ? 'Updating...' : 'Update Patient'}
                </span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
