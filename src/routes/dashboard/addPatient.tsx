import { useForm } from '@tanstack/react-form'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { signupSchema } from '#/schemas/auth'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import { Gender, Roles } from '#/generated/prisma/enums'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import React, { useTransition } from 'react'
import { addPatientAction } from '#/server/actions'
import { showToast } from '#/lib/showToast'

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
  const [isPending, startTransition] = useTransition()

  const addPatientSchema = signupSchema.omit({ password: true })
  const form = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      cellNo: '',
      role: Roles.Patient as Roles,
      gender: '' as Gender,
      dateOfBirth: new Date(),
    },
    validators: {
      onSubmit: addPatientSchema,
      onChange: addPatientSchema,
    },

    onSubmit: ({ value }) => {
      startTransition(async () => {
        showToast.loading(`Creating user (${value.fullName}).`, {
          id: 'create-account',
        })
        try {
          await addPatientAction({
            ...value,
            password: 'generatePassword',
          })
          showToast.success(
            `Account (${value.fullName}) created successfully.`,
            {
              id: 'create-account',
            },
          )
          navigate({
            to: '/dashboard/viewPatients',
            search: { search: value.fullName },
          })
        } catch (error) {
          console.error('Error creating patient:', error)
          showToast.error('Something went wrong saving the patient.', {
            id: 'create-account',
          })
        }
      })
    },
  })
  return (
    <div className="p-8">
      <div className="text-3xl font-bold text-white mb-4 text-center">
        Add New Patient!
      </div>
      <form
        noValidate
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
                name="fullName"
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
                        disabled={isPending}
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
                name="cellNo"
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
                        disabled={isPending}
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
                        disabled={isPending}
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
                          field.handleChange(value as Gender)
                        }
                      >
                        <SelectTrigger
                          id={field.name}
                          onBlur={field.handleBlur}
                          aria-invalid={isInvalid}
                          className="w-full cursor-pointer"
                          disabled={isPending}
                        >
                          <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>

                        <SelectContent position="popper">
                          {Object.values(Gender).map((gender) => (
                            <SelectItem key={gender} value={gender as string}>
                              {gender as string}
                            </SelectItem>
                          ))}
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
                name="dateOfBirth"
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
                          isPending={isPending}
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
                disabled={isPending}
                type="submit"
              >
                <span className="absolute inset-0 flex items-center justify-center">
                  {isPending ? 'Creating Patient ID...' : 'Submit'}
                </span>
              </Button>
            </div>
          </Field>
        </FieldGroup>
      </form>
    </div>
  )
}
