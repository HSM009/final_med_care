import { useForm } from '@tanstack/react-form'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { addPatientSchema } from '#/schemas/auth'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { toast } from 'sonner'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import { Gender } from '#/generated/prisma/enums'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import React from 'react'
import { addPatientAction } from '#/server/actions'

const DateOfBirthPicker = React.lazy(() =>
  import('#/components/datePicker').then((mod) => ({
    default: mod.DateOfBirthPicker,
  })),
)

export const Route = createFileRoute('/dashboard/addPatient')({
  component: RouteComponent,
})
function RouteComponent() {
  const navigate = useNavigate()

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      age: new Date(),
      phone: '',
      gender: '' as Gender,
    },
    validators: {
      onSubmit: addPatientSchema,
      onChange: addPatientSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await addPatientAction({ data: value })
        toast.success('Account Creates Successfully.')
        navigate({
          to: '/dashboard/viewPatients',
        })
      } catch (error) {
        console.error('Error creating patient:', error)
        toast.error('Something went wrong saving the patient.')
      }
    },
  })
  return (
    <div className="p-8">
      <div className="text-3xl font-bold text-white mb-4 text-center">
        Add New Patient!
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <Card className="mt-6">
          <CardContent>
            <FieldGroup>
              <form.Field
                name="name"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Full Name:</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="HSM"
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
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardContent>
            <FieldGroup>
              <form.Field
                name="phone"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Phone Number:
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="03211234567"
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
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardContent>
            <FieldGroup>
              <form.Field
                name="email"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Email:</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="hsm#example.com"
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
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardContent>
            <FieldGroup>
              <form.Field
                name="gender"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid

                  return (
                    <Field orientation="responsive" data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Gender:</FieldLabel>
                      <Select
                        name={field.name}
                        value={field.state.value}
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
                          disabled={form.state.isSubmitting}
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
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardContent>
            <FieldGroup>
              <form.Field
                name="age"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Date of Birth:
                      </FieldLabel>
                      <React.Suspense
                        fallback={
                          <div className="h-10 w-full animate-pulse bg-gray-700 rounded" />
                        }
                      >
                        <DateOfBirthPicker
                          onDateChange={(date) =>
                            field.handleChange(date ?? new Date())
                          }
                        />
                      </React.Suspense>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              />
            </FieldGroup>
          </CardContent>
        </Card>
        <FieldGroup>
          <Field>
            <div className="mt-6">
              <Button
                className="cursor-pointer bg-green-800 hover:bg-green-700 text-white px-20 relative"
                disabled={form.state.isSubmitting}
                type="submit"
              >
                <span className="absolute inset-0 flex items-center justify-center">
                  {form.state.isSubmitting
                    ? 'Creating Patient ID...'
                    : 'Submit'}
                </span>
              </Button>
            </div>
          </Field>
        </FieldGroup>
      </form>
    </div>
  )
}
