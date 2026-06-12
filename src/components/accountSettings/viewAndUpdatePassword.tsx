import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { authClient } from '@/lib/auth-client'
import { useForm } from '@tanstack/react-form'
import { CheckIcon, EditIcon, Loader2, XIcon } from 'lucide-react'
import { useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'

interface ViewAndUpdateAccountSettingPasswordProps {
  validatorHandler: any
}

export function ViewAndUpdateAccountSettingPassword({
  validatorHandler,
}: ViewAndUpdateAccountSettingPasswordProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isForwarding, setIsForwarding] = useState(false)
  const [isSubmitting, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  const form = useForm({
    defaultValues: {
      newPassword: '',
      currentPassword: '',
    },
    validators: {
      onChange: validatorHandler,
    },
    onSubmit: async ({ value }) => {
      startTransition(async () => {
        await authClient.changePassword({
          newPassword: value.newPassword,
          currentPassword: value.currentPassword,
          revokeOtherSessions: true,

          fetchOptions: {
            onSuccess: () => {
              toast.success('Password updated successfully.')
              setIsEditing(false)
              setIsForwarding(true)
            },
            onError: ({ error }) => {
              if (error.code === 'INCORRECT_PASSWORD') {
                toast.error('Current password is incorrect. Please try again.')
              } else if (error.code === '401') {
                toast.error(
                  'Your new password does not meet the required criteria.',
                )
              } else if (error.code === 'INVALID_PASSWORD') {
                toast.error('Your currnent password is invalid.')
                form.setFieldMeta('currentPassword', (prev) => ({
                  ...prev,
                  isTouched: true,

                  errorMap: {
                    ...prev.errorMap,
                    onSubmit: 'The current password you entered is invalid.',
                  },
                }))
              } else {
                toast.error(error.message)
              }
            },
          },
        })
      })
    },
  })

  return (
    <div className="mt-6">
      <Card>
        {/* <CardHeader>
          <CardTitle className="text-lg">Update Password:</CardTitle>
        </CardHeader> */}
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
          >
            {/* <h3 className="text-lg font-medium mb-4">Update Password</h3> */}
            <FieldGroup>
              <form.Field
                name="currentPassword"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name} className="text-xs">
                        Current Password:
                      </FieldLabel>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          ref={inputRef}
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder={
                            isEditing ? 'Enter current password' : '••••••••'
                          }
                          autoComplete="off"
                          type="password"
                          disabled={isSubmitting || !isEditing}
                        />
                        {!isEditing ? (
                          <Button
                            type="button"
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                            disabled={isSubmitting}
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setIsEditing(true)
                              setIsForwarding(false)
                              setTimeout(() => {
                                inputRef.current?.focus()
                              }, 0)
                            }}
                            title="Edit Password"
                          >
                            <EditIcon className="size-4" />
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Button
                              type="submit"
                              className="bg-green-600 hover:bg-green-700 text-white min-w-10"
                              disabled={isSubmitting}
                              title="Confirm Password Change"
                            >
                              {isSubmitting ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <CheckIcon className="size-4" />
                              )}
                            </Button>

                            <Button
                              type="button"
                              className="bg-red-600 hover:bg-red-700 text-white"
                              disabled={isSubmitting}
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                form.reset()
                                setIsEditing(false)
                              }}
                              title="Cancel Changes"
                            >
                              <XIcon className="size-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      {isInvalid && (
                        <>
                          <FieldError errors={field.state.meta.errors} />
                          <FieldError>
                            {field.state.meta.errorMap.onSubmit}
                          </FieldError>
                        </>
                      )}
                    </Field>
                  )
                }}
              />

              {/* New Password Field */}
              <form.Field
                name="newPassword"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field
                      data-invalid={isInvalid}
                      className={!isEditing ? 'hidden' : ''}
                    >
                      <FieldLabel htmlFor={field.name} className="text-xs">
                        New Password:
                      </FieldLabel>
                      <div className="mt-1">
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="Enter new password"
                          autoComplete="off"
                          type="password"
                          disabled={isSubmitting || !isEditing}
                        />
                      </div>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              />
            </FieldGroup>
          </form>

          {isForwarding && (
            <div className="mt-4 text-sm text-green-600">
              Your password has been updated. Please allow a moment for the
              changes to reflect across the application.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
